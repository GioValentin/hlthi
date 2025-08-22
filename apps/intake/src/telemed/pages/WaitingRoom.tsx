import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import { Box, List, Typography, useTheme } from '@mui/material';
import { ottehrLightBlue } from '@theme/icons';
import { Duration } from 'luxon';
import { useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { getSelectors } from 'utils';
import { intakeFlowPageRoute } from '../../App';
import { StyledListItemWithButton } from '../../components/StyledListItemWithButton';
import { IntakeThemeContext } from '../../contexts';
import { safelyCaptureException } from '../../helpers/sentry';
import { CallSettings, CancelVisitDialog } from '../components';
import { useAppointmentStore } from '../features/appointments';
import { CustomContainer, useIntakeCommonStore } from '../features/common';
import { InvitedParticipantListItemButton, ManageParticipantsDialog } from '../features/invited-participants';
import { createIOSMessageCallStarted, sendIOSAppMessage } from '../features/ios-communication';
import { useIOSAppSync } from '../features/ios-communication/useIOSAppSync';
import { UploadPhotosDialog, UploadPhotosListItemButton } from '../features/upload-photos';
import { useGetWaitStatus, useWaitingRoomStore } from '../features/waiting-room';

const WaitingRoom = (): JSX.Element => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { otherColors } = useContext(IntakeThemeContext);
  const { estimatedTime, numberInLine } = getSelectors(useWaitingRoomStore, ['estimatedTime', 'numberInLine']);
  const [searchParams, _] = useSearchParams();
  const urlAppointmentID = searchParams.get('appointment_id');
  const location = useLocation();
  const isInvitedParticipant = location.pathname === intakeFlowPageRoute.InvitedWaitingRoom.path;
  const { appointmentID: persistedAppointmentId } = getSelectors(useAppointmentStore, ['appointmentID']);
  const { isIOSApp } = useIOSAppSync();
  const [isManageParticipantsDialogOpen, setManageParticipantsDialogOpen] = useState<boolean>(false);
  const [isUploadPhotosDialogOpen, setUploadPhotosDialogOpen] = useState<boolean>(false);
  const [isCancelVisitDialogOpen, setCancelVisitDialogOpen] = useState<boolean>(false);
  const [isAppointmentJustCanceled, setIsAppointmentJustCanceled] = useState<boolean>(false);
  const [isCallSettingsOpen, setIsCallSettingsOpen] = useState(false);

  useEffect(() => {
    if (urlAppointmentID && urlAppointmentID !== persistedAppointmentId) {
      useAppointmentStore.setState(() => ({ appointmentID: urlAppointmentID }));
    }
  }, [urlAppointmentID, persistedAppointmentId]);

  const currentAppointmentId = urlAppointmentID || persistedAppointmentId || '';

  useGetWaitStatus(
    (data) => {
      if (!data) {
        return;
      }
      useWaitingRoomStore.setState(data);
      if (data.status == 'on-video') {
        if (isIOSApp && currentAppointmentId) {
          try {
            sendIOSAppMessage(createIOSMessageCallStarted({ appointmentID: currentAppointmentId }));
            return;
          } catch (error) {
            safelyCaptureException(error);
          }
        }
        if (isInvitedParticipant) {
          const url = new URL(window.location.href);
          navigate(intakeFlowPageRoute.InvitedVideoCall.path + url.search);
        } else {
          navigate(intakeFlowPageRoute.VideoCall.path);
        }
      }
      if (!isAppointmentJustCanceled && !isCancelVisitDialogOpen) {
        if (data.status == 'complete') {
          useIntakeCommonStore.setState({ error: 'The call has ended. Please, request another visit' });
          navigate(intakeFlowPageRoute.Homepage.path);
        }
        if (data.status == 'cancelled') {
          useIntakeCommonStore.setState({ error: 'The appointment you tried to access was canceled' });
          navigate(intakeFlowPageRoute.Homepage.path);
        }
      }
    },
    currentAppointmentId,
    10000,
    !isAppointmentJustCanceled
  );

  return (
    <CustomContainer
      title="Waiting room"
      img={ottehrLightBlue}
      imgAlt="HLTHi icon"
      imgWidth={80}
      subtext="Please wait, chat will start automatically. A provider expert will connect with you soon. (If the chat doesn't popup within 10 seconds please refresh the page.)"
    >
      <Box
        sx={{
          backgroundColor: otherColors.lightBlue,
          color: theme.palette.secondary.main,
          padding: 2,
          marginBottom: 3,
          marginTop: 3,
          borderRadius: '8px',
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
        }}
      >
        <Typography variant="subtitle1" color={theme.palette.primary.main}>
          Approx. wait time - {estimatedTime ? Duration.fromMillis(estimatedTime).toFormat("mm'mins'") : '...mins'}
        </Typography>
        <Typography variant="subtitle1" color={theme.palette.primary.main}>
          Number in line - {numberInLine || '...'}
        </Typography>
        <Typography variant="subtitle1" color={theme.palette.primary.main}>
          Thanks for your patience. You don’t need to remain in this room—feel free to wait wherever is comfortable. We’ll text you when your provider is ready, and your place in line is secure.
        </Typography>
        <Typography variant="subtitle1" color={theme.palette.primary.main}>
          Wait times are longer than usual. However, most patients are being seen within 2 hours, often sooner than the posted estimate.  
        </Typography>
      </Box>

      <List sx={{ p: 0 }}>
        {!isInvitedParticipant && (
          <>
            <InvitedParticipantListItemButton onClick={() => setManageParticipantsDialogOpen(true)} hideText={false} />
            <UploadPhotosListItemButton onClick={() => setUploadPhotosDialogOpen(true)} hideText={false} />
          </>
        )}

        {!isIOSApp && (
          <StyledListItemWithButton
            onClick={() => setIsCallSettingsOpen(true)}
            primaryText="Call settings & testing"
            secondaryText="Setup audio, video, microphone to avoid technical issues now"
            noDivider={isInvitedParticipant}
          >
            <SettingsOutlinedIcon sx={{ color: otherColors.purple }} />
          </StyledListItemWithButton>
        )}

        {!isInvitedParticipant && (
          <>
            <StyledListItemWithButton
              onClick={() => navigate('/home')}
              primaryText="Leave waiting room"
              secondaryText="We will notify you once the call starts"
            >
              <img alt="HLTHi icon" src={ottehrLightBlue} width={24} />
            </StyledListItemWithButton>

            {/* <StyledListItemWithButton
              onClick={() => setCancelVisitDialogOpen(true)}
              primaryText="Cancel visit"
              secondaryText="Please reach out to support after cancelling for a refund."
              noDivider
            >
              <CancelOutlinedIcon sx={{ color: otherColors.clearImage }} />
            </StyledListItemWithButton> */}
          </>
        )}
      </List>

      {isManageParticipantsDialogOpen ? (
        <ManageParticipantsDialog onClose={() => setManageParticipantsDialogOpen(false)} />
      ) : null}
      {isUploadPhotosDialogOpen ? <UploadPhotosDialog onClose={() => setUploadPhotosDialogOpen(false)} /> : null}
      {isCancelVisitDialogOpen ? (
        <CancelVisitDialog
          appointmentID={currentAppointmentId}
          onClose={(canceled) => {
            setCancelVisitDialogOpen(false);
            setIsAppointmentJustCanceled(canceled);
          }}
        />
      ) : null}
      {isCallSettingsOpen ? <CallSettings onClose={() => setIsCallSettingsOpen(false)} /> : null}
    </CustomContainer>
  );
};

export default WaitingRoom;
