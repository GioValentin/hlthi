import React, {  useState } from 'react';
import { Button, Typography, Grid } from '@mui/material';
import { useFormContext } from 'react-hook-form';
import {PaymentElement,useStripe, useElements,} from '@stripe/react-stripe-js';

interface PaymentMethodInputProps {
  onPaymentMethodChange: (paymentMethod: string) => void;
}

export const PaymentMethodInput: React.FC<PaymentMethodInputProps> = ({ onPaymentMethodChange }) => {
  
  const {  setValue } = useFormContext();
  const [show, setShow] = useState(false);
  const stripe = useStripe();
  const elements = useElements();

  const handleChange = (paymentMethod: string) => {
    onPaymentMethodChange(paymentMethod);
  };

  const handlePayment = async () => {
    if (!stripe || !elements) return; // Ensure Stripe.js is ready

    try {
      const result = await stripe.confirmSetup({
        elements,
        redirect: 'if_required'
      });

      if (result.error) {
        console.error("Payment error:", result.error.message);
      } else {
        setValue('paymentMethod', result.setupIntent.payment_method);
        //@ts-ignore
        handleChange(result.setupIntent.payment_method);
      }
    } catch (error) {
      console.error("Unexpected error during payment:", error);
    }

    setShow(false);
  };

  const handleClose = () => {
    setShow(false);
  }

  const handleOpen = () => {
    setShow(true);
  }

  return (
    <>
    {!show && (
      
      <Button
      variant='outlined'
      onClick={handleOpen}
      size='large'
      sx={{
        marginTop: 2,
        fontWeight: '700',
      }}
    >
      <Typography variant="body1" marginTop={0} fontSize={'0.5em'}>Add New Payment Method</Typography>
    </Button>
    )}
    {show && (
      <>
      <PaymentElement />
      <Grid container justifyContent="space-between">
        <Button
        variant='text'
        onClick={handleClose}
        size='small'
        sx={{
          marginTop: 2,
          fontWeight: '700',
        }}
      >
        <Typography>Cancel</Typography>
      </Button>
      <Button
        variant='outlined'
        onClick={handlePayment}
        size='small'
        sx={{
          marginTop: 2,
          fontWeight: '700',
          color: 'white',
        }}
      >
        <Typography>Add</Typography>
      </Button>
      </Grid>
      
    </>
    )}
    </>
  );
};
