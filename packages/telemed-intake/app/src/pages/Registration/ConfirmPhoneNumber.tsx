//@ts-nocheck
import { Box, Button, Dialog, Paper, Typography } from '@mui/material';
import { DateTime } from 'luxon';
import { useCallback, useMemo, useState,useEffect } from 'react';
import { FieldValues } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ErrorDialog, FormInputType, PageForm, safelyCaptureException } from 'ottehr-components';
import { UpdateAppointmentResponse, getSelectors, yupDateTransform } from 'ottehr-utils';
import { IntakeFlowPageRoute } from '../../App';
import {
  useAccountInfoStore
} from '../../features/account-info';
import TagManager from "react-gtm-module";
import { CustomContainer } from '../../features/common';
import { handleClosePastTimeErrorDialog, isSlotTimePassed, useZapEHRAPIClient } from '../../utils';
import { decode } from 'html-entities';

const ConfirmPhoneNumber = (): JSX.Element => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const apiClient = useZapEHRAPIClient();
  const [requestErrorDialogOpen, setRequestErrorDialogOpen] = useState<boolean>(false);
  const [timer, setTimer] = useState(0);
  
  const [openModal, setOpenModal] = useState(false);
  const [isLoading, setLoading] = useState(false);

  const { pendingAccountInfoUpdates, accountInfo: currentAccountInfo } = getSelectors(useAccountInfoStore, [
    'pendingAccountInfoUpdates',
    'accountInfo',
  ]);

  const accountInfo = { ...currentAccountInfo, ...pendingAccountInfoUpdates };

  const formElements: FormInputType[] = [
    {
      type: 'Text',
      name: 'one-time-code',
      label: 'Please enter the code that was sent to your mobile device',
      required: true,
      autoComplete:'one-time-code'
    },
  ];

  const createOnValidation = (data: object): void => {
    console.log(data)
  };
  
  const handleSubmit = async (data: object): void => {

    setLoading(true);

    const code = data['one-time-code'];

    if(code.length != 6) {
      throw new Error("Code is invalid");
    }
    
    if(!apiClient) {
      throw new Error("Invalid API Client");
    }

    try {
      const checkSMSVerification = await apiClient.checkSMSVerification({
        code: data['one-time-code'],
        phone: accountInfo.phone
      });

      if(checkSMSVerification.status == 'approved') {

        const createAccount = await apiClient.createAccount({
          account: accountInfo
        });

        accountInfo.billingId = createAccount.customer.id
        accountInfo.phoneVerified = true;

        useAccountInfoStore.setState({
          accountInfo: accountInfo
        });
        setLoading(false);
        
        TagManager.dataLayer({
          dataLayer: {
            event: "signup"
          }
        });

        window.location.href = createAccount.invitedUser.invitationUrl;
        return;
      }
      
    } catch(e) {

      setRequestErrorDialogOpen(true);
      setLoading(false);
      return;

    }
    

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

  // useEffect(() => {
  //   // Only start a countdown if timer is greater than 0
  //   let interval = null;
  //   if (timer > 0) {
  //     interval = setInterval(() => {
  //       setTimer(prevTimer => prevTimer - 1);
  //     }, 1000);
  //   }
  //   // Clear the interval when timer reaches 0 or on component unmount
  //   return () => clearInterval(interval);
  // }, [timer]);

  // const handleClick = async () => {
  //   // Place your SMS sending logic here
  //   if(!apiClient) {
  //     throw new Error("No api client");
  //   }

  //   const verification = await apiClient.createSMSVerification({
  //     phone: accountInfo.phone
  //   });
    
  //   // Reset the timer to 30 seconds to disable the button
  //   setTimer(30);
  // };

  return (
    <CustomContainer
      title={`Please Verify ${accountInfo.phone}`}
      bgVariant={IntakeFlowPageRoute.ConfirmDateOfBirth.path}
    >
      <>
        <PageForm
          formElements={formElements}
          loading={isLoading}
          controlButtons={{
            submitLabel: t('general.button.continue')
          }}
          onSubmit={handleSubmit}
        />
        <Dialog
          open={openModal}
          onClose={() => setOpenModal(false)}
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <Paper>
            <Box sx={{ m: { md: 5, xs: 3 }, maxWidth: 'sm' }}>
              <Typography sx={{ width: '100%' }} variant="h2" color="primary.main">
                Invalid Entry
              </Typography>
              <Typography sx={{ mt: 2 }}>
                You provided an invalid code.
              </Typography>
              <Typography sx={{ mt: 1 }}>Try Again</Typography>
              <Box
                display="flex"
                flexDirection={{ xs: 'column', md: 'row' }}
                sx={{ justifyContent: 'space-between', mt: 4.125 }}
                gap={{ xs: 2 }}
              >
                <Button
                  variant="contained"
                  onClick={() => setOpenModal(false)}
                  size="large"
                  type="button"
                  color="secondary"
                >
                  {t('general.button.tryAgain')}
                </Button>
              </Box>
            </Box>
          </Paper>
        </Dialog>
        <ErrorDialog
          open={requestErrorDialogOpen}
          title="Code Expired or Invalid Code."
          description="The code that you've provided has either expired or is incorrect."
          closeButtonText={t('general.button.close')}
          handleClose={() => setRequestErrorDialogOpen(false)}
        />
      </>
    </CustomContainer>
  );
};

export default ConfirmPhoneNumber;
