import React, { useEffect, useState, SyntheticEvent } from 'react';
import { FormInputTypeField } from '../../types';
import { FieldValues, useFormContext } from 'react-hook-form';
import { Box, Grid, Typography } from '@mui/material';
import { Link, RadioGroupProps, SxProps } from '@mui/material';
import { useAuth0 } from '@auth0/auth0-react';


import { RadioOption } from '../../types';


type RadioInputProps = {
  client: object; 
  formInput: FormInputTypeField; 
  values: FieldValues; 
  name: string;
  label: string;
  options: RadioOption[];
  required?: boolean;
  helperText?: string;
  showHelperTextIcon?: boolean;
  borderColor?: string;
  centerImages?: boolean;
  onChange: (event: SyntheticEvent) => void;
  radioStyling?: SxProps;
} & RadioGroupProps;

export const MembershipDetails: React.FC<RadioInputProps> = (props) => {
  const { client } = props;
  
  const [stripeLink, setStripeLink ] = useState<string | undefined>(undefined);
  const [plans, setPlans] = useState<'Free' | 'Base' | 'Standard Care' | 'On-Demand' | undefined>('Free');
  const [planRates, setRatePlans] = useState<129.99 | 39.99 | 29.99 | 69.99>(129.99);
  const { setValue } = useFormContext();

  const { user } = useAuth0();
  
  useEffect(() => {
    
    
    const getCustomer = async () => {
      
      if (!user?.sub) return; // Ensure user is available before making a request
  
      try {
        // @ts-ignore
        const customer = await client.getStripeCustomer({ customerId: user.sub, sessionId: true });

        try {

          // Set Stripe Link
          
          setStripeLink(customer.portal.url);

          setValue('customerId', customer.customer.id);
          // Check subscription statues

          if(customer.customer.subscriptions) {

            const subscriptions = customer.customer.subscriptions;

            // Lets look further into the subscriptions

            for(var i = 0; i < subscriptions.data.length; i++) {

              const subscription = subscriptions.data[i];

              if(subscription.status == 'active') {

                const items = subscription.items;

                if(items.data) {

                  for(var pi = 0; pi < items.data.length; pi++) {
                    switch(items.data[pi].plan.product) {
                      case 'prod_RmKWO1FaDHxpTh': // Base
                        setPlans('Base');
                        setRatePlans(39.99);
                        setValue('visitRate', 39.99 * 100);
                        break;
                      case 'prod_RqOCXlSqUEk0Wz': // Standard Care
                        setPlans('Standard Care');
                        setRatePlans(29.99);
                        setValue('visitRate', 29.99 * 100);
                        break;
                      case 'prod_RqOC259ZFWJDwe': // On-Demand
                        setPlans('On-Demand');
                        setRatePlans(69.99);
                        setValue('visitRate', 69.99 * 100);
                        break;
                      default:
                        setPlans('Free');
                        setRatePlans(129.99);
                        setValue('visitRate', 129.99 * 100);
                        break;
                    }
                  }

                }

              }

            }

          } else {
            setPlans('Free');
            setRatePlans(129.99);
            setValue('visitRate', 129.99 * 100);
          }
                    
        } catch(e) {
          console.log(e);
        }
        
      } catch (error) {
        console.error("Error fetching Stripe customer:", error);
      }
    };

    getCustomer(); // Call the function inside useEffect
  }, [user?.sub]); // Dependency ensures it runs only when user.sub changes

  return (
    <>
      {stripeLink && (
            <>
        <Box mb={1}>
          <Typography variant="h4" color="primary">
            Review & Start Appointment 
          </Typography>
        </Box>
      
        <Grid display="flex" direction="row" justifyContent="space-between">
          <Box mb={1}>
            <Typography variant="body1" color="primary">
              Your Current Plan
            </Typography>
            
          </Box>
    
          <Box mb={1}>
            <Typography>
              {plans}
            </Typography>
          </Box>
        </Grid>
        <Grid display="flex" direction="row" justifyContent="space-between">
          <Box mb={1}>
            <Typography variant="body1" color="primary">
              Price For Today's Visit
            </Typography>
          </Box>
    
          <Box mb={1}>
            <Typography variant="body1" color="primary">
              ${planRates}
            </Typography>
          </Box>
        </Grid>
    
        <Grid display="flex" direction="row" justifyContent="space-between">
          <Box mb={1}>
            <Typography variant="h4" color="primary">
              -
            </Typography>
          </Box>
    
          <Box mb={1}>
            <Link variant="body1" href={stripeLink}>
              Manage Plan & Save
            </Link>
          </Box>
        </Grid>

        <Typography variant="body1" color='#8F9AA7' marginTop={2} marginBottom={4} fontSize='0.5em'>
          By clicking "Continue," you agree to create a new appointment. A credit authorization will be placed on your card for the amount of your visit fee. If you proceed with the consultation and connect with a provider, this charge is final and non-refundable. If you cancel before speaking with a provider, the authorization will be removed.
        </Typography>
      </>
      )}
      
    </>
  );
};
