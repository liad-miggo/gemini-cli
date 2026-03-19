/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { Box, Text } from 'ink';
import { UserIdentity } from './UserIdentity.js';
import { Tips } from './Tips.js';
import { useSettings } from '../contexts/SettingsContext.js';
import { useConfig } from '../contexts/ConfigContext.js';
import { useUIState } from '../contexts/UIStateContext.js';
import { Banner } from './Banner.js';
import { useBanner } from '../hooks/useBanner.js';
import { useTips } from '../hooks/useTips.js';
import { theme } from '../semantic-colors.js';
import { ThemedGradient } from './ThemedGradient.js';
import { CliSpinner } from './CliSpinner.js';

import { isAppleTerminal } from '@google/gemini-cli-core';

import {
  longAsciiLogoCompact,
  shortAsciiLogoCompact,
  tinyAsciiLogoCompact,
} from './AsciiArt.js';
import { getAsciiArtWidth } from '../utils/textUtils.js';

interface AppHeaderProps {
  version: string;
  showDetails?: boolean;
}

const DEFAULT_ICON = `▝▜▄  
  ▝▜▄
 ▗▟▀ 
▝▀    `;

/**
 * The default Apple Terminal.app adds significant line-height padding between
 * rows. This breaks Unicode block-drawing characters that rely on vertical
 * adjacency (like half-blocks). This version is perfectly symmetric vertically,
 * which makes the padding gaps look like an intentional "scanline" design
 * rather than a broken image.
 */
const MAC_TERMINAL_ICON = `▝▜▄  
  ▝▜▄
  ▗▟▀
▗▟▀  `;

export const AppHeader = ({ version, showDetails = true }: AppHeaderProps) => {
  const settings = useSettings();
  const config = useConfig();
  const { terminalWidth, bannerData, bannerVisible, updateInfo } = useUIState();

  const { bannerText } = useBanner(bannerData);
  const { showTips } = useTips();

  const authType = config.getContentGeneratorConfig()?.authType;
  const loggedOut = !authType;

  const showHeader = !(
    settings.merged.ui.hideBanner || config.getScreenReader()
  );

  const ICON = isAppleTerminal() ? MAC_TERMINAL_ICON : DEFAULT_ICON;

  let logoArt = ICON;
  if (loggedOut && terminalWidth > 0) {
    const widthOfLongLogo = getAsciiArtWidth(longAsciiLogoCompact) + 10;
    const widthOfShortLogo = getAsciiArtWidth(shortAsciiLogoCompact) + 10;

    if (terminalWidth >= widthOfLongLogo) {
      logoArt = longAsciiLogoCompact.replace(/^\n/, ''); // remove leading newline
    } else if (terminalWidth >= widthOfShortLogo) {
      logoArt = shortAsciiLogoCompact.replace(/^\n/, '');
    } else {
      logoArt = tinyAsciiLogoCompact.replace(/^\n/, '');
    }
  }

  if (!showDetails) {
    return (
      <Box flexDirection="column">
        {showHeader && (
          <Box
            flexDirection="row"
            marginTop={1}
            marginBottom={1}
            paddingLeft={1}
          >
            <Box flexShrink={0}>
              <ThemedGradient>{logoArt}</ThemedGradient>
            </Box>
            <Box marginLeft={2} flexDirection="column">
              <Box>
                <Text bold color={theme.text.primary}>
                  Gemini CLI
                </Text>
                <Text color={theme.text.secondary}> v{version}</Text>
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      {showHeader && (
        <Box flexDirection="row" marginTop={1} marginBottom={1} paddingLeft={1}>
          <Box flexShrink={0}>
            <ThemedGradient>{logoArt}</ThemedGradient>
          </Box>
          <Box marginLeft={2} flexDirection="column">
            {/* Line 1: Gemini CLI vVersion [Updating] */}
            <Box>
              <Text bold color={theme.text.primary}>
                Gemini CLI
              </Text>
              <Text color={theme.text.secondary}> v{version}</Text>
              {updateInfo && (
                <Box marginLeft={2}>
                  <Text color={theme.text.secondary}>
                    <CliSpinner /> Updating
                  </Text>
                </Box>
              )}
            </Box>

            {/* Line 2: Blank */}
            <Box height={1} />

            {/* Lines 3 & 4: User Identity info (Email /auth and Plan /upgrade) */}
            {settings.merged.ui.showUserIdentity !== false && (
              <UserIdentity config={config} />
            )}
          </Box>
        </Box>
      )}

      {bannerVisible && bannerText && (
        <Banner
          width={terminalWidth}
          bannerText={bannerText}
          isWarning={bannerData.warningText !== ''}
        />
      )}

      {!(settings.merged.ui.hideTips || config.getScreenReader()) &&
        showTips && <Tips config={config} />}
    </Box>
  );
};
