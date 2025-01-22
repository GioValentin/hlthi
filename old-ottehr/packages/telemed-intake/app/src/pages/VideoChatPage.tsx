import { FC, useState } from 'react';
import { Container, Typography } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import { getSelectors } from 'ottehr-utils';
import { IntakeFlowPageRoute } from '../App';
import { CallSideCard, LoadingSpinner, VideoRoom } from '../components';
import { useAppointmentStore } from '../features/appointments';
import { CustomContainer } from '../features/common';
import { useJoinCall, useVideoCallStore } from '../features/video-call';
import { useZapEHRAPIClient } from '../utils';
import { DeviceLabels, useMeetingManager } from 'amazon-chime-sdk-component-library-react';
import { MeetingSessionConfiguration } from 'amazon-chime-sdk-js';
import { ThemeProvider } from 'styled-components';
import { MeetingProvider, lightTheme, GlobalStyles } from 'amazon-chime-sdk-component-library-react';

const VideoChatPage: FC = () => {
  const videoCallState = getSelectors(useVideoCallStore, ['meetingData']);
  const meetingManager = useMeetingManager();

  const [error, setError] = useState<Error | null>(null);

  const apiClient = useZapEHRAPIClient();
  const [searchParams] = useSearchParams();
  const urlAppointmentID = searchParams.get('appointmentID');

  if (urlAppointmentID) {
    useAppointmentStore.setState(() => ({ appointmentID: urlAppointmentID }));
  }

  useJoinCall(
    apiClient,
    async (response) => {
      useVideoCallStore.setState({ meetingData: response });

      const meetingSessionConfiguration = new MeetingSessionConfiguration(response.Meeting, response.Attendee);
      const options = {
        deviceLabels: DeviceLabels.AudioAndVideo,
      };

      await meetingManager.join(meetingSessionConfiguration, options);

      await meetingManager.start();
    },
    setError,
  );

  if (error) {
    return (
      <CustomContainer useEmptyBody title="" bgVariant={IntakeFlowPageRoute.VideoCall.path}>
        <Typography sx={{ color: 'primary.contrast' }} variant="h6">
          {error.message}
        </Typography>
      </CustomContainer>
    );
  }

  if (!videoCallState.meetingData) {
    return (
      <CustomContainer useEmptyBody title="" bgVariant={IntakeFlowPageRoute.VideoCall.path}>
        <LoadingSpinner transparent />
      </CustomContainer>
    );
  }

  return (
    <CustomContainer useEmptyBody title="" bgVariant={IntakeFlowPageRoute.VideoCall.path}>
      <Container maxWidth="xl" sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>
        <VideoRoom />
        <CallSideCard />
      </Container>
    </CustomContainer>
  );
};

const VideoChatPageContainer: FC = () => {
  return (
    <ThemeProvider theme={lightTheme}>
      <GlobalStyles />
      <MeetingProvider>
        <VideoChatPage />
      </MeetingProvider>
    </ThemeProvider>
  );
};

export default VideoChatPageContainer;
