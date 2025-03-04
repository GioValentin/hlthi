//@ts-nocheck
import { Box, Button, Dialog, Paper, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ErrorDialog, FormInputType, PageForm } from 'ottehr-components';
import { getSelectors } from 'ottehr-utils';
import { IntakeFlowPageRoute } from '../../App';
import {
  useAccountInfoStore
} from '../../features/account-info';
import TagManager from "react-gtm-module";
import { CustomContainer } from '../../features/common';
import {useZapEHRAPIClient } from '../../utils';

const SetupBilling = (): JSX.Element => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const apiClient = useZapEHRAPIClient();

  const { pendingAccountInfoUpdates, accountInfo: currentAccountInfo } = getSelectors(useAccountInfoStore, [
    'pendingAccountInfoUpdates',
    'accountInfo',
  ]);

  const accountInfo = { ...currentAccountInfo, ...pendingAccountInfoUpdates };
  const plans = [
    {
      label: 'Free - $0/Month - $129.99 Per Visit',
      value: 'Free',
    },
    {
      label: 'Base - $39/Month - $52 Per Visit',
      value: 'Base',
    },
    {
      label: 'Standard Care - $49/Month - $30 Per Visit',
      value: 'Standard Care'
    },
    {
      label: 'On-Demand - $12/Month - $105 Per Visit',
      value: 'On-Demand',
    }
  ];

  const formElements: FormInputType[] = [
    {
      type: 'Radio',
      name: 'plan',
      label: 'Choose Billing Plan',
      radioOptions: plans,
      required: true
    }
  ];

  const createOnValidation = (data: object): void => {
    console.log(data)
  };
  
  const handleSubmit = (data: object): void => {

    console.log(data)
    
    // if (!firstDate.equals(secondDate)) {
    //   setOpenModal(true);
    // } else {
    //   updateResourcesOrNavigateNext();
    // }
  };

  const updateResourcesOrNavigateNext = (): void => {
    // const { pendingPatientInfoUpdates } = usePatientInfoStore.getState();
    // const { appointmentID } = useAppointmentStore.getState();
    // const { paperworkQuestions } = usePaperworkStore.getState();

    // if (pendingPatientInfoUpdates || !appointmentID) {
    //   createOrUpdateAppointment(formattedDOB !== patientInfo?.dateOfBirth);
    //   return;
    // }

    // if (getPaperworkEnabled && paperworkQuestions && paperworkQuestions.length > 0) {
    //   navigate(`/paperwork/${paperworkQuestions?.[0].slug}`);
    // } else {
    //   //setGetPaperworkEnabled(true);
    // }
  };

  return (
    <CustomContainer
      title={`Setup Billing Information`}
      bgVariant={IntakeFlowPageRoute.ConfirmDateOfBirth.path}
    >
      <>
        <PageForm
          formElements={formElements}
          controlButtons={{
            submitLabel: t('general.button.continue')
          }}
          onSubmit={handleSubmit}
        />
      </>
    </CustomContainer>
  );
};

export default SetupBilling;
