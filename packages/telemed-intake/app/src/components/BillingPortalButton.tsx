import { Button, Typography } from '@mui/material';
import { useZapEHRAPIClient } from '../utils'
import { useAuth0 } from '@auth0/auth0-react';
import { usePatientInfoStore } from '../features/patient-info';

interface BillingPortalButtonProps {
    fn?: () => void;
  }

export const BillingPortalButton = ({ fn }: BillingPortalButtonProps): JSX.Element => {
    const { isAuthenticated } = useAuth0();
    const patient = usePatientInfoStore((state) => state.patientInfo);

    const zapEHRAPIClient = useZapEHRAPIClient();
    if (fn !== undefined) {
        
    }

    const onClick = async () => {
        console.log(patient.id)
        if (isAuthenticated) {
            try {
                const data = await zapEHRAPIClient?.getBillingPortalLink({
                    customerId: patient.id,
                });

                console.log('What is the patient ID:  ' + patient.id);

                if (data?.url) {
                    window.open(data.url, '_blank');
                } else {
                    console.warn('No billing portal URL returned');
                }
            } catch (error) {
                console.error('Failed to fetch billing portal link:', error);
            }
        } else {
            console.warn('User is not authenticated');
        }
      }
  return (
    <Button
      variant="text"
      aria-label='Billing'
      color="inherit"
      sx={{ fontWeight: 500, '&:hover': { backgroundColor: 'transparent' } }}
      onClick={onClick}
    >
      <Typography variant="body2">Billing</Typography>
    </Button>
  );
};