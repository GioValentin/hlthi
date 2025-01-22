import { useQuery } from 'react-query';
import { useAppointmentStore } from '../appointments';
import { ZapEHRAPIClient } from 'ottehr-components';
import { PromiseReturnType } from 'ottehr-utils';

export const useJoinCall = (
  apiClient: ZapEHRAPIClient | null,
  onSuccess: (data: PromiseReturnType<ReturnType<ZapEHRAPIClient['joinCall']>>) => void,
  setError: (err: Error) => void,
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
) => {
  return useQuery(
    ['join-call', apiClient],
    () => {
      const { appointmentID } = useAppointmentStore.getState();

      if (apiClient && appointmentID) {
        return apiClient.joinCall({ appointmentId: appointmentID });
      }

      throw new Error('api client not defined or appointmentID not provided');
    },
    {
      onSuccess,
      onError: (err: Error) => {
        setError(err);
        console.error('Error during executing joinCall: ', err);
      },
    },
  );
};
