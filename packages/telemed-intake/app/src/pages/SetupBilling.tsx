import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { IntakeFlowPageRoute } from '../App';
import { usePatientInfoStore } from '../features/patient-info';
import { useNavigate,useSearchParams } from 'react-router-dom';
import { useEffect,useState } from 'react';
import { LoadingSpinner } from '../components';
import { money } from '@theme/icons';
import { useZapEHRAPIClient } from '../utils'

import { CustomContainer } from '../features/common';
import { sleep } from 'ottehr-utils';


// If using TypeScript, add the following snippet to your file as well.
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'stripe-pricing-table': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}

const SetupBilling = (): JSX.Element => {
    const navigate = useNavigate();
    const [checkoutSession, setCheckoutSession] = useState<string | undefined>(undefined);
    const [loading, setLoading] = useState(true);
    const [isActive, setIsActive] = useState(false);
    const { t } = useTranslation();
    const patient = usePatientInfoStore.getState();
    const zapEHRAPIClient = useZapEHRAPIClient();
    const [searchParams, _] = useSearchParams();
    const checkoutSessionId = searchParams.get('cid');
    
    useEffect(() => {

      if(zapEHRAPIClient) {
        const checkIfActive =  async () => { 

          const response = await zapEHRAPIClient?.getPatientSubscriptionStatus({
            dob: patient.patientInfo.dateOfBirth,
            email:  patient.patientInfo.email
          });
  
          if(response?.active == true) {
            setIsActive(response?.active);
          } else {
            console.log(response);
            if(!checkoutSessionId) {
              fetchCheckoutSession();
              setLoading(false);
            } else {
              setIsActive(true);
              setLoading(false);
            }
  
            setIsActive(false);
          }
        };
        
        const fetchCheckoutSession = async () => {
            try {
  
              // Create New Customer
              //@ts-ignore
            const requestResponse = await zapEHRAPIClient?.createStripeCustomer({
              dob:  patient.patientInfo.dateOfBirth || '',
              email:  patient.patientInfo.email || '',
              firstName: patient.patientInfo.firstName || '',
              lastName: patient.patientInfo.lastName || '',
              phone: '',
              patientId: ''
            });
  
            // Setup A Checkout Session
            const checkoutSession = await zapEHRAPIClient?.createStripeCheckoutSession({
                
                customerId: requestResponse.id || '',
                mode: 'subscription',
                return_url: 'https://portal.hlthi.life/setup-billing',
                success_url: 'https://portal.hlthi.life/waiting-room?appointment_id=', // Add Appointment Ref,
                items: [
                  {
                    price: 'price_1QWmkyIiL0oeTlYv6YRe1xbl',
                    // price_data: {
                    //   currency: 'usd',
                    //   product: 'prod_RPbyc52YzeIwrl'
                    // },
                    quantity: 1
                  }
                ]
              });
                  
              setCheckoutSession(checkoutSession?.client_secret);
              setLoading(false);
                
          } catch (error) {
            console.error('Error fetching checkout session:', error);
          } finally {
            setLoading(false);
          }
          
        };
        
        if(checkoutSessionId) {
          setIsActive(true);
          setLoading(false);
        } else {
          checkIfActive();
        }
        
      }
      
    }, [zapEHRAPIClient]);

    useEffect(() => {
      if (checkoutSession) {
        console.log('Checkout session updated:', checkoutSession);
        // Add side-effect logic here
      }

    }, [checkoutSession]); // Runs whenever checkoutSession changes

    useEffect(() => {
      
      if(isActive == true) {
       sleep(3);
       navigate(IntakeFlowPageRoute.PatientPortal.path);
      }

    }, [isActive]); // Runs whenever checkoutSession changes

    if (loading) {
      return <LoadingSpinner />; // Show a loading state while the promise resolves
    }
    
    if(!checkoutSessionId && isActive == false) {

      if (!checkoutSession) {
        return <LoadingSpinner />; // Show a loading state while the promise resolves
      }

      return (
        <CustomContainer
          title={t('setupBilling.title')}
          img={t('setupBilling.imgAlt') ? money : undefined}
          imgAlt={t('setupBilling.imgAlt')}
          imgWidth={100}
          bgVariant={IntakeFlowPageRoute.NewUser.path}
        >
          <Typography variant="body1">{t('setupBilling.message')}</Typography>
          <div dangerouslySetInnerHTML={{ __html: t('setupBilling.html') }} />
  
          <stripe-pricing-table
            pricing-table-id="prctbl_1QensbIiL0oeTlYv1oWQr11p"
            publishable-key="pk_test_51OqyFSIiL0oeTlYviynklXYIKJTIHSV9crJi99qnAqNxgwawNYjhioSo9GdJmxWWHtuHuNL9mkpA05tiXgnqzr2q00HOGQp0Iz"
            customer-session-client-secret={checkoutSession}
          />
        </CustomContainer>
      );
    } else {
      
      return (
        <CustomContainer
          title={t('setupBillingCompleted.title')}
          img={t('setupBillingCompleted.imgAlt') ? money : undefined}
          imgAlt={t('setupBillingCompleted.imgAlt')}
          imgWidth={100}
          bgVariant={IntakeFlowPageRoute.NewUser.path}
        >
          <Typography variant="body1">You're being redirected to the patient portal</Typography>
          <div dangerouslySetInnerHTML={{ __html: t('setupBillingCompleted.html') }} />
          
        </CustomContainer>
      );
      
    }
    
   
  };

export default SetupBilling;