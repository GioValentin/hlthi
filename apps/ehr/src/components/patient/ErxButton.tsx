import { RoundedButton } from '@components/RoundedButton';
import { useTheme } from '@mui/material';
import { FC, useEffect, useState } from 'react';
import { useApiClients } from '@hooks/useAppClients';

type ERXButtonProps = {
  patient: string;
};

export const ErxButton: FC<ERXButtonProps> = ({ patient }) => {
  const theme = useTheme();
  const { oystehr } = useApiClients();

  const [ssoLink, setSsoLink] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [lastPatientId, setLastPatientId] = useState<string | null>(null);

  useEffect(() => {
    if (!patient || patient === lastPatientId) return;

    setLoading(true);
    setError(null);

    oystehr?.erx
      .connectPractitioner({ patientId: patient })
      .then((response) => {
        setSsoLink(response.ssoLink);
        setLastPatientId(patient);
      })
      .catch((e) => {
        setError(e);
        setSsoLink(undefined);
      })
      .finally(() => setLoading(false));
  }, [patient, oystehr, lastPatientId]);

  return (
    <RoundedButton
      sx={{ width: '100%' }}
      to={ssoLink ?? '#'}
      target="_blank"
      disabled={loading || !ssoLink || error}
    >
      {loading ? 'Loading Rx...' : error ? 'Rx Unavailable' : 'Rx Orders'}
    </RoundedButton>
  );
};
