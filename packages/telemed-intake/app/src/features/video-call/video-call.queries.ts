import { useQuery } from 'react-query';
import { useAppointmentStore } from '../appointments';
import { usePatientInfoStore } from '../patient-info';
import { ZapEHRAPIClient } from 'ottehr-components';
import { PromiseReturnType } from 'ottehr-utils';


const VITE_APP_PROJECT_API_CONSOLE_URL = import.meta.env.VITE_APP_PROJECT_API_CONSOLE_URL;
const VITE_APP_ZAPEHR_PROJECT_ID = import.meta.env.VITE_APP_ZAPEHR_PROJECT_ID;
const VITE_APP_CHAT_ROOM_ENDPOINT = import.meta.env.VITE_APP_CHAT_ROOM_ENDPOINT;

export const useJoinCall = (
  apiClient: ZapEHRAPIClient | null,
  token: string | undefined,
  onSuccess: (data: PromiseReturnType<ReturnType<ZapEHRAPIClient['joinCall']>>) => void,
  setError: (err: Error) => void,
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
) => {
  return useQuery(
    ['join-call', apiClient, token],
    () => {
      
      const { appointmentID, conversationID } = useAppointmentStore.getState();
      const patient = usePatientInfoStore.getState();

      // const provider = apiClient?.getProvider({
      //   uuid: providerID
      // });

      console.log( useAppointmentStore.getState());
      if (apiClient && appointmentID) {
        
        const conversationLink = apiClient.getConversationLink(
          
          token,
          {
            conversationID: conversationID
          },
          appointmentID,
          patient,
          VITE_APP_PROJECT_API_CONSOLE_URL,
          VITE_APP_ZAPEHR_PROJECT_ID,
          VITE_APP_CHAT_ROOM_ENDPOINT
        );

        conversationLink.then((data) => {

          console.log(data);
          
          useAppointmentStore.setState({
            
            chat: data?.Meeting.generatedLink
          });
        });

         console.log("GOING INTO HERE?");

         console.log(conversationLink)
        
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

export const useJoinChat = (
  apiClient: ZapEHRAPIClient | null,
  token: string | undefined,
  onSuccess: (data: PromiseReturnType<Boolean>) => void,
  setError: (err: Error) => void,
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
) => {
  return useQuery(
    ['join-call', apiClient, token],
    () => {
      
      const { appointmentID, conversationID } = useAppointmentStore.getState();
      const patient = usePatientInfoStore.getState();

      if (apiClient && appointmentID) {
        
        const conversationLink = apiClient.getConversationLink(
          
          token,
          {
            conversationID: conversationID
          },
          appointmentID,
          patient,
          VITE_APP_PROJECT_API_CONSOLE_URL,
          VITE_APP_ZAPEHR_PROJECT_ID,
          VITE_APP_CHAT_ROOM_ENDPOINT
        );

        conversationLink.then((data) => {
          useAppointmentStore.setState({
            chat: data?.Meeting.generatedLink
          });
        });
        
        return true
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
