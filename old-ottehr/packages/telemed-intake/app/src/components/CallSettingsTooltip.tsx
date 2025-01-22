import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { ClickAwayListener, IconButton, List, Box } from '@mui/material';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import SettingsIcon from '@mui/icons-material/Settings';
import CloseIcon from '@mui/icons-material/Close';
import { clockFullColor } from '@theme/icons';
import { StyledListItemWithButton, CustomTooltip } from 'ottehr-components';
import { otherColors } from '../IntakeThemeProvider';
import { IconButtonContained } from './IconButtonContained';

type CallSettingsTooltipProps = {
  isTooltipOpen: boolean;
  handleTooltipOpen: () => void;
  handleTooltipClose: () => void;
  openSettings: () => void;
};

export const CallSettingsTooltip: FC<CallSettingsTooltipProps> = (props) => {
  const { isTooltipOpen, handleTooltipOpen, handleTooltipClose, openSettings } = props;
  const { t } = useTranslation();

  return (
    <ClickAwayListener onClickAway={handleTooltipClose}>
      <div>
        <CustomTooltip
          PopperProps={{
            disablePortal: true,
          }}
          onClose={handleTooltipClose}
          open={isTooltipOpen}
          disableFocusListener
          disableHoverListener
          disableTouchListener
          title={
            <Box sx={{ p: 3, width: '300px', position: 'relative' }}>
              <List sx={{ p: 0 }}>
                <StyledListItemWithButton
                  primaryText={t('callSettings.reportProblem')}
                  secondaryText={t('callSettings.reportProblemDescription')}
                >
                  <img alt={t('callSettings.reportProblemImgAlt')} src={clockFullColor} width={24} />
                </StyledListItemWithButton>
                <StyledListItemWithButton
                  primaryText={t('callSettings.setting')}
                  secondaryText={t('callSettings.audioVideo')}
                  onClick={() => {
                    handleTooltipClose();
                    openSettings();
                  }}
                  noDivider
                >
                  <SettingsOutlinedIcon sx={{ color: otherColors.purple }} />
                </StyledListItemWithButton>
              </List>
              <IconButton onClick={handleTooltipClose} size="small" sx={{ position: 'absolute', right: 0, top: 0 }}>
                <CloseIcon fontSize="small" sx={{ color: otherColors.toolTipClose }} />
              </IconButton>
            </Box>
          }
        >
          <IconButtonContained onClick={handleTooltipOpen} variant={isTooltipOpen ? 'disabled' : undefined}>
            <SettingsIcon sx={{ color: isTooltipOpen ? otherColors.brightPurple : otherColors.white }} />
          </IconButtonContained>
        </CustomTooltip>
      </div>
    </ClickAwayListener>
  );
};
