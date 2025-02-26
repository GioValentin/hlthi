
import { useAuth0 } from '@auth0/auth0-react';
import { LoadingButton } from '@mui/lab';
import { Box, darken, styled, useTheme } from '@mui/material';
import { FC, useCallback, useEffect, useState } from 'react';
import { useQueryClient } from 'react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import { ApptStatus, mapStatusToTelemed, getConversationLink, getAddressString } from 'ehr-utils';
import { getSelectors } from '../../../shared/store/getSelectors';
import { ConfirmationDialog } from '../../components';
import { useGetAppointmentAccessibility } from '../../hooks';
import { useZapEHRAPIClient } from '../../hooks/useZapEHRAPIClient';
import { useAuthToken } from '../../../hooks/useAuthToken';
import {
  useAppointmentStore,
  useChangeTelemedAppointmentStatusMutation,
  useChangeChatTelemedAppointmentStatusMutation,
  useGetMeetingData,
  useGetConversationData,
  useInitTelemedSessionMutation,
  useInitChatTelemedSessionMutation,
  useVideoCallStore,
  useChatStore,
} from '../../state';
import { updateEncounterStatusHistory } from '../../utils';
import useOttehrUser from '../../../hooks/useOttehrUser';
import { red } from '@mui/material/colors';
import { Encounter } from 'fhir/r4';

const VITE_APP_ZAPEHR_PROJECT_ID = import.meta.env.VITE_APP_ZAPEHR_PROJECT_ID;
const VITE_APP_PROJECT_API_URL = import.meta.env.VITE_APP_PROJECT_API_URL;

const FooterButton = styled(LoadingButton)(({ theme }) => ({
  textTransform: 'none',
  fontSize: '15px',
  fontWeight: 700,
  borderRadius: 20,
  backgroundColor: theme.palette.primary.main,
  '&:hover': { backgroundColor: darken(theme.palette.primary.main, 0.125) },
  '&.MuiLoadingButton-loading': {
    backgroundColor: darken(theme.palette.primary.main, 0.25),
  },
  '& .MuiLoadingButton-loadingIndicator': {
    color: darken(theme.palette.primary.contrastText, 0.25),
  },
}));

export const AppointmentFooterButton: FC = () => {
  const { encounter, appointment, isAppointmentLoading, conversationEncounter } = getSelectors(useAppointmentStore, [
    'encounter',
    'appointment',
    'isAppointmentLoading',
    'conversationEncounter'
  ]);

  const ottehrUser = useOttehrUser();
  const { getAccessTokenSilently } = useAuth0();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const queryClient = useQueryClient();
  const apiClient = useZapEHRAPIClient();
  const changeTelemedAppointmentStatus = useChangeTelemedAppointmentStatusMutation();
  const changeChatTelemedAppointmentStatus = useChangeChatTelemedAppointmentStatusMutation();
  const initTelemedSession = useInitTelemedSessionMutation();
  const initChatTelemedSession = useInitChatTelemedSessionMutation();
  const getMeetingData = useGetMeetingData(
    getAccessTokenSilently,
    (data) => {
      useVideoCallStore.setState({ meetingData: data });
    },
    () => {
      throw new Error('Error trying to connect to a patient.');
    },
  );

  const getConversationData = useGetConversationData(
    getAccessTokenSilently,
    (data) => {

      useChatStore.setState({
        conversation: {
          id: data.id,
          encounterId: data.encounterId,
          link: data.link
        }
      });
    },
    () => {
      throw new Error('Error trying to connect to a patient.');
    }
  );

  const [buttonType, setButtonType] = useState<'assignMe' | 'connectUnassign' | 'reconnect' | null>(null);
  const [conversationLoading, setConversationLoading] =  useState<boolean>(false);

  const appointmentAccessibility = useGetAppointmentAccessibility('telemedicine');

  useEffect(() => {
    if (appointmentAccessibility.status !== ApptStatus.ready && !appointmentAccessibility.isStatusEditable) {
      setButtonType(null);
    } else if (appointmentAccessibility.status === ApptStatus.ready) {
      setButtonType('assignMe');
    } else if (appointmentAccessibility.status === ApptStatus['pre-video']) {
      setButtonType('connectUnassign');
    } else if (appointmentAccessibility.status === ApptStatus['on-video']) {
      setButtonType('reconnect');
    }

  }, [appointmentAccessibility]);

  const onAssignMe = async (): Promise<void> => {
    if (!apiClient || !appointment?.id) {
      throw new Error('api client not defined or appointment id not provided');
    }
    await changeTelemedAppointmentStatus.mutateAsync(
      { apiClient, appointmentId: appointment.id, newStatus: ApptStatus['pre-video'] },
      {},
    );

    await queryClient.invalidateQueries({ queryKey: ['telemed-appointment'] });
  };

  const userAuthToken = useAuthToken();

  const endChatConnect = useCallback((): void => {

    setConversationLoading(true);

    if (!apiClient || !appointment?.id) {
      setConversationLoading(false);
      throw new Error('api client not defined or userId not provided');
    }

    const executeStatusChange = async (apiClient: any , appointment:any) => {
      try {
        await changeChatTelemedAppointmentStatus.mutateAsync(
          {
            apiClient,
            appointmentId: appointment?.id,
            newStatus: ApptStatus.complete,
          },
          {}
        );
      } catch (error) {
        console.error("Failed to update appointment status:", error);
      }

      useAppointmentStore.setState({
        encounter: {
          ...encounter,
          status: 'finished',
          statusHistory: updateEncounterStatusHistory('finished', encounter.statusHistory),
        },
        conversationEncounter: {
          ...conversationEncounter,
          status: 'finished',
          statusHistory: updateEncounterStatusHistory('finished', conversationEncounter.statusHistory),
        }
      });

      setConversationLoading(false);
      
      useAppointmentStore.setState({ currentTab: 'hpi' });
    };
  
    executeStatusChange(apiClient,appointment);

  }, [apiClient, appointment?.id, appointment?.status, conversationEncounter, getMeetingData, ottehrUser]);


  const onChatConnect = useCallback((): void => {

    // Conversation Loading
    setConversationLoading(true);

    let hasChatResource = undefined;

    if(conversationEncounter) {
      hasChatResource = conversationEncounter.extension?.some((ext) =>
        ext.extension?.some(
          (nestedExt) =>
            nestedExt.url === 'channelType' &&
            nestedExt.valueCoding?.code === 'twilio-conversations'
        )
      );
    } 

    if(hasChatResource) {

      if(conversationEncounter?.status == 'finished') {
        setConversationLoading(false);

        // throw new Error('Conversation Already Completed');
      }

      void getConversationData.refetch({ throwOnError: true });

      setConversationLoading(false);

      useAppointmentStore.setState({ currentTab: 'view_chat' });
    } else {

      if (!apiClient || !appointment?.id) {
        throw new Error('api client not defined or userId not provided');
      }
      
      initChatTelemedSession.mutate(
        { apiClient, appointmentId: appointment.id, userId: ottehrUser?.id || '' },
        {
          onSuccess: async (response) => {
            
            useAppointmentStore.setState({
              conversationEncounter: response.encounter
            });
  
            const c = await getConversationLink(
              userAuthToken,
              getAddressString(response.encounter),
              appointment.id,
              {},
              import.meta.env.VITE_APP_PROJECT_API_URL,
              import.meta.env.VITE_APP_FHIR_API_URL,
              import.meta.env.VITE_APP_CHAT_ROOM_ENDPOINT ?? "https://chat.hlthi.life"
            );
  
            if(response?.encounter) {
  
              if(response.encounter.id) {
                useChatStore.setState({
                  conversation: {
                    id: getAddressString(response.encounter),
                    encounterId: response?.encounter?.id,
                    link: c.Meeting.generatedLink
                  }
                });
              }
            }
            
            setConversationLoading(false);
            useAppointmentStore.setState({ currentTab: 'view_chat' });
          },
          onError: () => {
            throw new Error('Error trying to connect to a patient.');
          },
        },
      );

    }

  }, [apiClient, appointment?.id, appointment?.status, encounter, getMeetingData, initChatTelemedSession, ottehrUser]);

  const onConnect = useCallback((): void => {
    
    if (mapStatusToTelemed(encounter.status, appointment?.status) === ApptStatus['on-video']) {
      void getMeetingData.refetch({ throwOnError: true });
    } else {
      if (!apiClient || !appointment?.id) {
        throw new Error('api client not defined or userId not provided');
      }

      initTelemedSession.mutate(
        { apiClient, appointmentId: appointment.id, userId: ottehrUser?.id || '' },
        {
          onSuccess: async (response) => {

            useAppointmentStore.setState({
              encounter: {
                ...encounter,
                status: 'in-progress',
                statusHistory: updateEncounterStatusHistory('in-progress', encounter.statusHistory),
              }
            });

          },
          onError: () => {
            throw new Error('Error trying to connect to a patient.');
          },
        },
      );
    }
  }, [apiClient, appointment?.id, appointment?.status, encounter, getMeetingData, initTelemedSession, ottehrUser]);

  useEffect(() => {
    if (appointmentAccessibility.status === ApptStatus['on-video']) {
      if (location.state?.reconnect) {
        navigate(location.pathname, {});
        onConnect();
      }
    }

  }, [appointmentAccessibility.status, location, navigate, onConnect]);

  const onUnassign = async (): Promise<void> => {
    if (!apiClient || !appointment?.id) {
      throw new Error('api client not defined or appointment id not provided');
    }
    await changeTelemedAppointmentStatus.mutateAsync(
      { apiClient, appointmentId: appointment.id, newStatus: ApptStatus.ready },
      {},
    );
    navigate('/telemed/appointments');
  };

  switch (buttonType) {
    case 'assignMe': {
      return (
        <ConfirmationDialog
          title="Do you want to assign this appointment?"
          response={onAssignMe}
          actionButtons={{
            proceed: {
              text: 'Assign to me',
            },
            back: { text: 'Cancel' },
          }}
        >
          {(showDialog) => (
            <FooterButton
              loading={changeTelemedAppointmentStatus.isLoading || isAppointmentLoading}
              onClick={showDialog}
              variant="contained"
            >
              Assign to me
            </FooterButton>
          )}
        </ConfirmationDialog>
      );
    }
    case 'connectUnassign': {
      return (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <ConfirmationDialog
            title="Do you want to connect to the patient?"
            description="This action will start the (optional) video call & chat."
            response={onConnect}
            actionButtons={{
              proceed: {
                text: 'Connect to Patient',
              },
              back: { text: 'Cancel' },
            }}
          >
            {(showDialog) => (
              <FooterButton
                loading={initTelemedSession.isLoading || getMeetingData.isLoading}
                onClick={showDialog}
                variant="contained"
              >
                Connect to Patient Video
              </FooterButton>
            )}
          </ConfirmationDialog>

          <ConfirmationDialog
            title="Do you want to connect to the patient via chat?"
            description="This action will start the chat."
            response={onChatConnect}
            actionButtons={{
              proceed: {
                text: 'Start Chat',
              },
              back: { text: 'Cancel' },
            }}
          >
            {(showDialog) => (

              (!conversationEncounter?.id) && (
                <FooterButton
                loading={conversationLoading}
                onClick={showDialog}
                variant="contained"
              >
               Start Chat With Patient
              </FooterButton>

              )
              
            )}
          </ConfirmationDialog>

          <ConfirmationDialog
            title="Do you want to end chat with patient?"
            description="This action will end the chat."
            response={endChatConnect}
            actionButtons={{
              proceed: {
                text: 'End Chat',
              },
              back: { text: 'Cancel' },
            }}
          >
            {(showDialog) => (

              (conversationEncounter?.id && conversationEncounter?.status == 'in-progress') && (
                <FooterButton
                loading={conversationLoading}
                onClick={showDialog}
                variant="contained"
                sx={{
                  backgroundColor: theme.palette.warning.main,
                  '&:hover': { backgroundColor: darken(theme.palette.warning.main, 0.125) },
                  '&.MuiLoadingButton-loading': {
                    backgroundColor: darken(theme.palette.warning.main, 0.25),
                  },
                  '& .MuiLoadingButton-loadingIndicator': {
                    color: darken(theme.palette.warning.contrastText, 0.25),
                  },
                }}
              >
               End Chat With Patient
              </FooterButton>

              )
              
            )}
          </ConfirmationDialog>

          <ConfirmationDialog
            title="Do you want to unassign this appointment?"
            response={onUnassign}
            actionButtons={{
              proceed: {
                text: 'Unassign',
                color: 'error',
              },
              back: { text: 'Cancel' },
            }}
          >
            {(showDialog) => (
              <FooterButton
                loading={changeTelemedAppointmentStatus.isLoading}
                onClick={showDialog}
                variant="contained"
                sx={{
                  backgroundColor: theme.palette.error.main,
                  '&:hover': { backgroundColor: darken(theme.palette.error.main, 0.125) },
                  '&.MuiLoadingButton-loading': {
                    backgroundColor: darken(theme.palette.error.main, 0.25),
                  },
                  '& .MuiLoadingButton-loadingIndicator': {
                    color: darken(theme.palette.error.contrastText, 0.25),
                  },
                }}
              >
                Unassign
              </FooterButton>
            )}
          </ConfirmationDialog>
        </Box>
      );
    }
    case 'reconnect': {
      return (
        <FooterButton
          loading={initTelemedSession.isLoading || getMeetingData.isLoading}
          onClick={onConnect}
          variant="contained"
        >
          Reconnect
        </FooterButton>
      );
    }
    default: {
      return null;
    }
  }
};
