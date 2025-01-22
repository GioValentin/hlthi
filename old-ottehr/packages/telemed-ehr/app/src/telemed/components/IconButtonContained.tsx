import { IconButton, styled, alpha, useTheme, darken } from '@mui/material';
import { otherColors } from '../../CustomThemeProvider';

export const IconButtonContained = styled(IconButton)<{ variant?: string }>(({ variant }) => {
  const theme = useTheme();
  let colors = {};

  switch (variant) {
    case 'disabled': {
      colors = {
        backgroundColor: darken(theme.palette.primary.contrastText, 0.125),
        '&:hover': { backgroundColor: alpha(theme.palette.primary.contrastText, 0.9) },
      };
      break;
    }
    case 'error': {
      colors = {
        backgroundColor: otherColors.endCallButton,
        '&:hover': { backgroundColor: alpha(otherColors.endCallButton, 0.9) },
      };
      break;
    }
    case 'primary': {
      colors = {
        backgroundColor: theme.palette.primary.main,
        '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.9) },
      };
      break;
    }
    default: {
      colors = {
        backgroundColor: alpha(otherColors.lightIconButton, 0.2),
        '&:hover': { backgroundColor: alpha(otherColors.lightIconButton, 0.1) },
      };
      break;
    }
  }

  return {
    ...colors,
  };
});
