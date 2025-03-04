//@ts-nocheck
import { useState,useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PageForm} from 'ottehr-components';
import { IntakeFlowPageRoute } from '../App';
import { CustomContainer } from '../features/common';
import { useAuth0 } from '@auth0/auth0-react';
import {Account, AllStates, getSelectors,} from 'ottehr-utils';
import {useAccountInfoStore} from '../features/account-info';
import {useZapEHRAPIClient,formatPhoneNumber} from '../utils';
import { Box, Button, Paper, Typography } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';


const CreateAccount = (): JSX.Element => {
  const { isAuthenticated, loginWithRedirect, isLoading, error } = useAuth0();
  const authRef = useRef<Promise<void> | null>(null);
  const { t } = useTranslation();
  const apiClient = useZapEHRAPIClient({
    tokenless: true
  });

  const handleLogin = () : void => {

    if(!isAuthenticated) {
      if (!authRef.current) { 
        authRef.current = loginWithRedirect();
      }
    }

    return;
  }

  const { accountInfo: currentAccountInfo, pendingAccountInfoUpdates } = getSelectors(useAccountInfoStore, [
    'accountInfo',
    'pendingAccountInfoUpdates',
  ]);
  const accountInfo = { ...currentAccountInfo, ...pendingAccountInfoUpdates, sub: undefined };
  const initialAccountInfoRef = useRef(currentAccountInfo);
  

  const navigate = useNavigate();
  const onSubmit = async (data: Account): Promise<void> => {
    

    const newAccount = {
      isNew: true,
      firstName: data.firstName,
      lastName: data.lastName,
      sex: data.sex,
      dateOfBirth: data.dateOfBirth,
      email: data.email,
      phone: data.phone,
      phoneVerified: false,
      plan: undefined,
      billingId: undefined,
      billingPortal: undefined,
      address: {
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2,
        city: data.city,
        state: data.state,
        postal: data.postal
      },
      sub: undefined
    };

    useAccountInfoStore.setState({
      pendingAccountInfoUpdates: newAccount
    });

    if(!apiClient) {
      throw new Error("Missing API CLient");
    }

    const createSMSVerification = await apiClient?.createSMSVerification({
      phone: data.phone
    });

    console.log(createSMSVerification);
    
    navigate(IntakeFlowPageRoute.ConfirmPhoneNumber.path);
    return;

  };

  return (
    <CustomContainer
      title="Welcome to HLTHi"
      description='To have access you must login or create an account.'
      bgVariant={IntakeFlowPageRoute.PatientPortal.path}
    >
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          type="submit"
          sx={{
            mt: 2,
            backgroundColor: '#39413e', // Set button background to black
            color: 'white', // Set text color to white
            '&:hover': {
              backgroundColor: '#333', // Optional: Slightly lighter black for hover effect
            },
            '&:disabled': {
              backgroundColor: '#aaa', // Optional: Grey background when disabled
              color: '#fff', // Ensure text is still visible
            },
          }}
          onClick={handleLogin}
        >
          Login
        </Button>
      </Box>
      <Typography sx={{ mt: 2, mb: 2, textAlign:'center'}}> - or - </Typography>
      <Typography variant="h3" color="primary.main">
                  Create an Account
      </Typography>
      <PageForm
        formElements={[
          {
            type: 'Text',
            name: 'firstName',
            label: t('general.formElement.labels.firstName'),
            defaultValue: accountInfo?.firstName,
            required: true,
            width: 6,
          },
          {
            type: 'Text',
            name: 'lastName',
            label: t('general.formElement.labels.lastName'),
            defaultValue: accountInfo?.lastName,
            required: true,
            width: 6,
          },
          {
            type: 'Date',
            name: 'dateOfBirth',
            label: t('general.formElement.labels.dateOfBirth'),
            defaultValue: accountInfo?.dateOfBirth,
            required: true,
          },
          {
            type: 'Text',
            name: 'email',
            label: t('general.formElement.labels.email'),
            format: 'Email',
            defaultValue: accountInfo?.email,
            required: true,
          },
          {
            type: 'Text',
            name: 'phone',
            label: "Valid US Mobile Number",
            format: 'Phone Number',
            defaultValue: accountInfo?.phone,
            required: true,
          },
          {
            
            type: 'Header 3',
            name: 'title',
            label: "Address Information"
          },
          {
            type: 'Text',
            name: 'addressLine1',
            label: 'Street Address',
            defaultValue: accountInfo?.address?.addressLine1,
            required: true,
          },
          {
            type: 'Text',
            name: 'addressLine2',
            label: "Eg. Unit Number, Apt, floor",
            defaultValue: accountInfo?.address?.addressLine2,
            required: false,
          },
          {
            type: 'Text',
            name: 'city',
            label: "City",
            defaultValue: accountInfo?.address?.city,
            required: true,
            width: 4,
          },
          {
            type: 'Select',
            name: 'state',
            label: "State",
            selectOptions: AllStates,
            defaultValue: accountInfo?.address?.state,
            required: true,
            width: 4,
          },
          {
            type: 'Text',
            name: 'postal',
            label: "Postal Code",
            format: 'ZIP',
            defaultValue: accountInfo?.address?.postal,
            required: true,
            width: 4,
          },
        ]}
        controlButtons={{
          loading: false,
          submitLabel: 'Next',
          backButton: false,
        }}
        onSubmit={onSubmit}
      />
    </CustomContainer>
  );
};

export default CreateAccount;
