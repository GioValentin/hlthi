import { FC, useState } from 'react';
import { Container, Typography } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import { getSelectors } from 'ottehr-utils';
import { IntakeFlowPageRoute } from '../App';
import { LoadingSpinner,ChatCard } from '../components';
import { useAppointmentStore } from '../features/appointments';
import { CustomContainer } from '../features/common';
import { useAuthToken, useZapEHRAPIClient } from '../utils';
import { useJoinChat } from '../features/video-call'

const ChatRoomPage: FC = () => {
  const token = useAuthToken()
  const apiClient = useZapEHRAPIClient();
  

  const [error, setError] = useState<Error | null>(null);

  // const apiClient = useZapEHRAPIClient();
  const [searchParams] = useSearchParams();
  const { chat } = getSelectors(useAppointmentStore, ['chat'])
  const urlAppointmentID = searchParams.get('appointmentID');

  if (urlAppointmentID) {
    useAppointmentStore.setState(() => ({ appointmentID: urlAppointmentID }));
  }

  useJoinChat(
    apiClient,
    token,
    async (response) => {
      console.log(response)
    },
    setError,
  );


  if (error) {
    return (
      <CustomContainer useEmptyBody title="" bgVariant={IntakeFlowPageRoute.ChatRoom.path}>
        <Typography sx={{ color: 'primary.contrast' }} variant="h6">
          {error.message}
        </Typography>
      </CustomContainer>
    );
  }

  if (!chat) {
    return (
      <CustomContainer useEmptyBody title="" bgVariant={IntakeFlowPageRoute.ChatRoom.path}>
        <LoadingSpinner transparent />
      </CustomContainer>
    );
  }

  return (
    <CustomContainer useEmptyBody title="" bgVariant={IntakeFlowPageRoute.ChatRoom.path}>
      <Container maxWidth="xl"  sx={{ marginTop: 0, display: 'flex', gap: 3, alignItems: 'flex-start', height: 500, paddingTop:0, paddingBottom: 0, paddingRight:0, paddingLeft:0}}>
        <ChatCard />
        {/* <ChatSideCard /> */}
      </Container>
    </CustomContainer>
  );
};

const ChatPageContainer: FC = () => {
  return (
    <ChatRoomPage />
  );
};

export default ChatPageContainer;
