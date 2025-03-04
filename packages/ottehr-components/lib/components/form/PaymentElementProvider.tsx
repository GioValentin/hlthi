import React, { useEffect, useState, SyntheticEvent } from 'react';
import { FormInputTypeField } from '../../types';
import { FieldValues, useFormContext,Controller } from 'react-hook-form';
import { Grid } from '@mui/material';
import { FormControl, FormControlLabel, Radio, RadioGroup, RadioGroupProps, SxProps } from '@mui/material';
import { useAuth0 } from '@auth0/auth0-react';
import {Elements} from '@stripe/react-stripe-js';
import  {loadStripe} from '@stripe/stripe-js';
import { PaymentMethodInput } from './PaymentMethodInput';

import { RadioOption } from '../../types';
import { BoldPurpleInputLabel } from './BoldPurpleInputLabel';

type STRIPE_OPTIONS = {
  clientSecret: string | undefined,
  customerSessionSecret: string | undefined,
}

type STRIPE_PAYMENT_METHOD = {
  id: string;
  brand: string | undefined,
  acct: string | undefined,
  label: string | undefined
}

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

const stripePromise = loadStripe(import.meta.env.VITE_APP_STRIPE_PUBLISHABLE_KEY);


export const PaymentElementProvider: React.FC<RadioInputProps> = (props) => {
  const { client, name, onChange, required } = props;
  
  const [ clientSecret, setClientSecret] = useState<string | undefined>(undefined);
  const [ customerSessionSecret, setCustomerSessionSecret] = useState<string | undefined>(undefined);
  const [ options, setOptions ] = useState<STRIPE_OPTIONS>({} as STRIPE_OPTIONS);
  const [ paymentMethods, setPaymentMethods] = useState<STRIPE_PAYMENT_METHOD[] | undefined>(undefined)

  const { user } = useAuth0();

  const { formState: { errors }, control } = useFormContext();
  const getCustomer = async () => {
    if (!user?.sub) return; // Ensure user is available before making a request

    try {
      // @ts-ignore
      const customer = await client.getStripeCustomer({ customerId: user.sub });

      setClientSecret(customer.setupIntent.client_secret);
      setCustomerSessionSecret(customer.session.client_secret);

      try {

        const list = [] as STRIPE_PAYMENT_METHOD[];

        for(var i = 0; i < customer.paymentMethods.data.length; i++) {
          const item = customer.paymentMethods.data[i];

          list.push({
            id: item.id,
            brand: item.card.brand,
            acct: item.card.last4,
            label: item.card.brand + ' - xxxx xxxx xxxx ' + item.card.last4
          } as STRIPE_PAYMENT_METHOD)
        }

        if(list.length > 0) {
          setPaymentMethods(list)
        }
        
      } catch(e) {

      }
      
    } catch (error) {
      console.error("Error fetching Stripe customer:", error);
    }
  };

  //@ts-ignore
  const handleUpdatedPaymentMethod = (paymentMethod: string) => {
    getCustomer();
  };

  useEffect(() => {
    
    getCustomer(); // Call the function inside useEffect
  }, [user?.sub]); // Dependency ensures it runs only when user.sub changes

  
useEffect(() => {
  setOptions({
    clientSecret,
    customerSessionSecret
  });
}, [clientSecret, customerSessionSecret]);

  return (
    <Grid>

        {paymentMethods && (
          <Controller
            name={name}
            control={control}
            render={({ field }) => {
              return (
                <FormControl variant="standard" required={required} error={!!errors[name]} sx={{ width: '100%', mt: 3.5 }}>
                  {/* Had to add a margin here and on FormControl because none of the variants worked properly */}
                  {/* Same for padding. I want to emphasize how much I hate this. */}
                  <BoldPurpleInputLabel id={`${name}-label`} shrink sx={{ mt: -2.25 }}>
                    Please Choose A Payment Method For Visit: 
                  </BoldPurpleInputLabel>
                  
                  <RadioGroup row {...field} value={field.value || 'unknown'} aria-labelledby={`${name}-label`}>
                    {paymentMethods.map((option) => {
                      return (
                        <FormControlLabel
                          value={option.id}
                          control={<Radio />}
                          key={option.id}
                          label={option.label}
                          onChange={onChange}
                          sx={{
                            marginRight: 5,
                          }}
                        />
                      );
                    })}
                  </RadioGroup>
                  {/* {!value && (
                    <InputHelperText
                      name={name}
                      errors={errors}
                      helperText={helperText}
                      showHelperTextIcon={showHelperTextIcon}
                    />
                  )} */}
                </FormControl>
              );
            }}
          />
        )}
        

      {options.clientSecret != undefined && (

        <Elements stripe={stripePromise} options={options}>
          <PaymentMethodInput onPaymentMethodChange={handleUpdatedPaymentMethod}/>
        </Elements>

      )}
      

    </Grid>
  );
};
