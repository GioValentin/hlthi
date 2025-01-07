import { Box, Button, Skeleton, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { IntakeFlowPageRoute } from '../App';
import { useAuth0 } from '@auth0/auth0-react';
import { usePatientInfoStore } from '../features/patient-info';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { PageForm } from 'ottehr-components';
import { clockFullColor } from '@theme/icons';

import { CustomContainer } from '../features/common';

const SetupBilling = (): JSX.Element => {
    const navigate = useNavigate();
    const { t } = useTranslation();
  
    useEffect(() => {
      //mixpanel.track('New User');
    }, []);

    const {user} = useAuth0();

    console.log(user);
    const patient = usePatientInfoStore.getState();

    console.log(patient);
  
    const onSubmit = async (): Promise<void> => {

      const patient = usePatientInfoStore.getState()

      console.log(patient)

      // navigate(IntakeFlowPageRoute.PatientInformation.path);
    };
  
    return (
      <CustomContainer
        title={t('setupBilling.title')}
        img={t('setupBilling.imgAlt') ? clockFullColor : undefined}
        imgAlt={t('setupBilling.imgAlt')}
        imgWidth={100}
        bgVariant={IntakeFlowPageRoute.NewUser.path}
      >
        <Typography variant="body1">{t('setupBilling.message')}</Typography>
        <div dangerouslySetInnerHTML={{ __html: t('setupBilling.html') }} />
        <PageForm onSubmit={onSubmit} controlButtons={{ backButton: false }} />
      </CustomContainer>
    );
  };

export default SetupBilling;