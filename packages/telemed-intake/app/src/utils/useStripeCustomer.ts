import { useAuth0 } from '@auth0/auth0-react';
import { useEffect, useState } from 'react';
import {useZapEHRAPIClientNoParams} from '../utils'
import Stripe from 'stripe'

let _customer: Stripe.Customer | undefined = undefined;
export const formatPhoneNumber = function(phone: string) {
  // Remove all non-digit characters
  let digits = phone.replace(/\D/g, '');
  
  // Ensure it's a valid 10-digit US number
  if (digits.length === 10) {
      return `+1${digits}`;
  } else {
      throw new Error("Invalid phone number format");
  }
}

export function useStripeCustomer(): { customer?: object, isLoading: boolean, error?: string } {
    const { isAuthenticated, user } = useAuth0();
    const [customer, setCustomer] = useState<object | undefined>(_customer);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | undefined>(undefined);
    const apiClient = useZapEHRAPIClientNoParams();
  
    useEffect(() => {
      let isMounted = true; 
  
      const fetchCustomer = async () => {
        if (isAuthenticated && !_customer?.id && user?.sub) {
          setIsLoading(true); 
          setError(undefined); 
  
          try {
            const cus = await apiClient?.getStripeCustomer({
              customerId: user.sub,
              sessionId: false
            });
  
            if (isMounted && cus != undefined) {
              _customer = cus.customer;
              setCustomer(cus.customer);
            }
          } catch (err: any) {
            if (isMounted) setError(err?.message || 'Failed to fetch customer');
          } finally {
            if (isMounted) setIsLoading(false); // ✅ Stop loading
          }
        }
      };
  
      fetchCustomer();
  
      return () => {
        isMounted = false;
      };

    }, [isAuthenticated, user, apiClient]);
  
    return { customer, isLoading, error };
  }