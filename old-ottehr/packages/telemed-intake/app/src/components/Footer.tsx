import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { Box, Typography } from '@mui/material';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { ContactSupportDialog } from './ContactSupportDialog';
import { ContactSupportButton } from './ContactSupportButton';
import { useIntakeCommonStore } from '../features/common';

const Footer: FC = () => {
  const { t } = useTranslation();
  const supportDialogOpen = useIntakeCommonStore((state) => state.supportDialogOpen);
  return (
    <Box sx={{ position: 'sticky', bottom: 0, pointerEvents: 'none' }}>
      {supportDialogOpen && (
        <ContactSupportDialog onClose={() => useIntakeCommonStore.setState({ supportDialogOpen: false })} />
      )}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          padding: '16px',
          pointerEvents: 'all',
          marginLeft: 'auto',
          width: 'fit-content',
        }}
      >
        <ContactSupportButton onClick={() => useIntakeCommonStore.setState({ supportDialogOpen: true })} />
      </Box>
      <Box
        sx={{
          width: '100%',
          backgroundColor: 'secondary.main',
          bottom: 0,
        }}
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <ErrorOutlineIcon color="warning" sx={{ pl: 1.25, marginTop: '9px', marginBottom: 'auto' }} />
        <Typography variant="body2" color="primary.contrast" sx={{ m: 1.25 }}>
          {t('general.footer')}
        </Typography>
      </Box>
    </Box>
  );
};
export default Footer;
