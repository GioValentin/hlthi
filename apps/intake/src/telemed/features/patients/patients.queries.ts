import { useQuery } from 'react-query';
import { ZapEHRAPIClient } from 'ui-components';
import { PromiseReturnType } from 'utils';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const useGetPatients = (
  apiClient: ZapEHRAPIClient | null,
  onSuccess: (data: PromiseReturnType<ReturnType<ZapEHRAPIClient['getPatients']>>) => void
) => {
  return useQuery(
    ['patients'],
    () => {
      if (apiClient) {
        return apiClient.getPatients();
      }
      throw new Error('api client not defined');
    },
    {
      enabled: false,
      onSuccess,
      onError: (err) => {
        console.error('Error during fetching get patients: ', err);
      },
    }
  );
};
