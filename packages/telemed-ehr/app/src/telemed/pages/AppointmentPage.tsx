
import { Box } from '@mui/material';
import { useStore } from 'zustand';
import { GlobalStyles, MeetingProvider, lightTheme } from 'amazon-chime-sdk-component-library-react';
import {
  Appointment,
  DocumentReference,
  Encounter,
  FhirResource,
  Location,
  Patient,
  QuestionnaireResponse,
} from 'fhir/r4';
import { FC, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { SCHOOL_WORK_NOTE_CODE, getQuestionnaireResponseByLinkId, getConversationLink, getAddressString } from 'ehr-utils';
import { getSelectors } from '../../shared/store/getSelectors';
import HearingRelayPopup from '../components/HearingRelayPopup';
import PreferredLanguagePopup from '../components/PreferredLanguagePopup';
import {
  AppointmentFooter,
  AppointmentHeader,
  AppointmentSidePanel,
  AppointmentTabs,
  ChatRoomContainer,
  VideoChatContainer,
} from '../features/appointment';
import { useAuthToken } from '../../hooks/useAuthToken';
import { useIsReadOnly } from '../hooks';
import {
  EXAM_OBSERVATIONS_INITIAL,
  RefreshableAppointmentData,
  useAppointmentStore,
  useExamObservationsStore,
  useGetTelemedAppointment,
  useRefreshableAppointmentData,
  useVideoCallStore,
  useChatStore
} from '../state';
import { EXAM_CARDS_INITIAL, useExamCardsStore } from '../state/appointment/exam-cards.store';
import { arraysEqual, extractPhotoUrlsFromAppointmentData } from '../utils';

export const AppointmentPage: FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthToken();

  const { meetingData } = getSelectors(useVideoCallStore, ['meetingData']);

  const useConversation = () => {
    return useStore(useChatStore, (state) => state.conversation);
  };

 const conversation = useConversation();

  useIsReadOnly();

  const { patientPhotoUrls: currentPatientPhotosUrls } = getSelectors(useAppointmentStore, ['patientPhotoUrls']);

  const [wasHearingRelayPopupOpen, setWasHearingRelayPopupOpen] = useState(false);
  const [shouldHearingRelayPopupBeOpened, setShouldHearingRelayPopupBeOpened] = useState(false);
  const [wasPreferredLanguagePopupOpen, setWasPreferredLanguagePopupOpen] = useState(false);
  const [shouldPreferredLanguagePopupBeOpened, setShouldPreferredLanguagePopupBeOpened] = useState(false);
  const [preferredLanguage, setPreferredLanguage] = useState<string | undefined>(undefined);
  const isPreferredLanguagePopupOpen = shouldPreferredLanguagePopupBeOpened && !wasPreferredLanguagePopupOpen;
  const isHearingRelayPopupOpen =
    shouldHearingRelayPopupBeOpened && !wasHearingRelayPopupOpen && !isPreferredLanguagePopupOpen;

  const closeHearingRelayPopup = (): void => {
    setWasHearingRelayPopupOpen(true);
  };

  const closePreferredLanguagePopup = (): void => {
    setWasPreferredLanguagePopupOpen(true);
  };

  // useRefreshableAppointmentData(
  //   {
  //     appointmentId: id,
  //   },
  //   (refreshedData: RefreshableAppointmentData) => {
  //     const updatedPatientConditionPhotoUrs = refreshedData.patientConditionPhotoUrs;

  //     const hasPhotosUpdates = !arraysEqual(currentPatientPhotosUrls, updatedPatientConditionPhotoUrs);

    
  //     if (hasPhotosUpdates) {

  //       useAppointmentStore.setState({
  //         patientPhotoUrls: updatedPatientConditionPhotoUrs,
  //       });
  //     }
  //   },
  // );

  const { isFetching } = useGetTelemedAppointment(
    {
      appointmentId: id,
    },
    (data) => {
      
      const conversationEncounter = data?.find((resource: FhirResource) => {
        // Check if the resource is of type 'Encounter'
        if (resource.resourceType === 'Encounter') {
          // Look for extensions with the specified code
          return resource.extension?.some((ext) =>
            ext.extension?.some(
              (nestedExt) =>
                nestedExt.url === 'channelType' &&
                nestedExt.valueCoding?.code === 'twilio-conversations'
            )
          );
        }
        return false; // Exclude non-matching resources
      }) as unknown as Encounter

      if(conversationEncounter) {

        const getLink = async () => {
          const response = await getConversationLink(
            user,
            getAddressString(conversationEncounter),
            id,
            {},
            import.meta.env.VITE_APP_PROJECT_API_URL,
            import.meta.env.VITE_APP_FHIR_API_URL,
            import.meta.env.VITE_APP_CHAT_ROOM_ENDPOINT ?? "http://localhost:3005"
          );

          return response.Meeting.generatedLink;
        };
        
        const setConversation = async () => {
          const link = await getLink();
        
          useChatStore.setState({
            conversation: {
              id: getAddressString(conversationEncounter),
              encounterId: conversationEncounter.id,
              link: link,
            },
          });
        };
        
        // Call the function to set the state
        setConversation();


      }

      const questionnaireResponse = data?.find(
        (resource: FhirResource) => resource.resourceType === 'QuestionnaireResponse',
      ) as unknown as QuestionnaireResponse;
      useAppointmentStore.setState({
        appointment: data?.find(
          (resource: FhirResource) => resource.resourceType === 'Appointment',
        ) as unknown as Appointment,
        patient: data?.find((resource: FhirResource) => resource.resourceType === 'Patient') as unknown as Patient,
        location: data?.find((resource: FhirResource) => resource.resourceType === 'Location') as unknown as Location,
        encounter: data?.find((resource: FhirResource) => {
          // Check if the resource is of type 'Encounter'
          if (resource.resourceType === 'Encounter') {
            // Look for extensions with the specified code
            return resource.extension?.some((ext) =>
              ext.extension?.some(
                (nestedExt) =>
                  nestedExt.url === 'channelType' &&
                  nestedExt.valueCoding?.code === 'chime-video-meetings'
              )
            );
          }
          return false; // Exclude non-matching resources
        }) as unknown as Encounter,
        conversationEncounter: conversationEncounter,
        questionnaireResponse,
        patientPhotoUrls: extractPhotoUrlsFromAppointmentData(data),
        schoolWorkNoteUrls:
          (data
            ?.filter(
              (resource: FhirResource) =>
                resource.resourceType === 'DocumentReference' &&
                resource.status === 'current' &&
                resource.type?.coding?.[0].code === SCHOOL_WORK_NOTE_CODE,
            )
            .flatMap((docRef: FhirResource) => (docRef as DocumentReference).content.map((cnt) => cnt.attachment.url))
            .filter(Boolean) as string[]) || [],
      });

      const relayPhone = getQuestionnaireResponseByLinkId('relay-phone', questionnaireResponse)?.answer.find(
        Boolean,
      )?.valueString;
      if (relayPhone?.toLowerCase() === 'yes') {
        setShouldHearingRelayPopupBeOpened(true);
      }
      const preferredLanguage = getQuestionnaireResponseByLinkId('preferred-language', questionnaireResponse)?.answer[0]
        .valueString;
      setPreferredLanguage(preferredLanguage);
      if (preferredLanguage && preferredLanguage !== 'English') {
        setShouldPreferredLanguagePopupBeOpened(true);
      }
    },
  );

  useEffect(() => {
    
    useAppointmentStore.setState({
      appointment: undefined,
      patient: undefined,
      location: undefined,
      encounter: {} as Encounter,
      conversationEncounter: {} as Encounter,
      questionnaireResponse: undefined,
      patientPhotoUrls: [],
      schoolWorkNoteUrls: [],
      chartData: undefined,
      currentTab: 'hpi',
    });
    useExamObservationsStore.setState(EXAM_OBSERVATIONS_INITIAL);
    useVideoCallStore.setState({ meetingData: null, conversation: null , twilioAuth: null });
    useExamCardsStore.setState(EXAM_CARDS_INITIAL);
    useChatStore.setState({conversation: null, meetingData: null, twilioAuth: null});

    return () => useAppointmentStore.setState({ patientPhotoUrls: [] });
  }, []);

  useEffect(() => {
    useAppointmentStore.setState({ isAppointmentLoading: isFetching });
  }, [isFetching]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}
    >
      <AppointmentHeader onClose={() => navigate('/telemed/appointments')} />

      <PreferredLanguagePopup
        isOpen={isPreferredLanguagePopupOpen}
        onClose={closePreferredLanguagePopup}
        preferredLanguage={preferredLanguage}
      />

      <HearingRelayPopup isOpen={isHearingRelayPopupOpen} onClose={closeHearingRelayPopup} />

      <Box sx={{ display: 'flex', flex: 1 }}>
        <AppointmentSidePanel appointmentType="telemedicine" />

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            m: 3,
            width: '100%',
          }}
        >
          {meetingData && (
            <ThemeProvider theme={lightTheme}>
              <GlobalStyles />
              <MeetingProvider>
                <VideoChatContainer />
              </MeetingProvider>
            </ThemeProvider>
          )}

          { conversation?.link && (

            <ThemeProvider theme={lightTheme}>
              <GlobalStyles/>
              <ChatRoomContainer/>
            </ThemeProvider>
          )}


          <Box sx={{ width: '100%' }}>
            <AppointmentTabs />
          </Box>
        </Box>
      </Box>

      <AppointmentFooter />
    </Box>
  );
};
