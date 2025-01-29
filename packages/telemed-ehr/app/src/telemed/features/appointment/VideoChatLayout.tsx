import { FC, useState, useRef,useEffect } from 'react';
import { Box, Card, Container, Dialog, Divider, PaperProps, useTheme } from '@mui/material';
import PictureInPictureIcon from '@mui/icons-material/PictureInPicture';
import PushPinIcon from '@mui/icons-material/PushPin';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import { AppointmentFooter } from './AppointmentFooter';
import Draggable from 'react-draggable';
import { PropsWithChildren } from '../../../shared/types';
import { IconButtonContained } from '../../components';

type LayoutType = 'pip' | 'pinned' | 'fullscreen';

export const VideoChatLayout: FC<PropsWithChildren> = ({ children }) => {
  const [type, setType] = useState<LayoutType>('pip');
  const nodeRef = useRef(null);
  const [videoPosition, setVideoPosition] = useState({ x: 0, y: 350 + 24 - window.innerHeight / 2});

  // useEffect(() => {
  //   const calculatePositions = () => {
  //     setVideoPosition({
  //       x: 0,
  //       y: 350 + 24 - window.innerHeight / 2,
  //     });

  //     setChatPosition({
  //       x: window.innerWidth - 500,
  //       y: window.innerHeight / 2 - 350 - 24,
  //     });
  //   };

  //   calculatePositions();
  //   window.addEventListener('resize', calculatePositions);
  //   return () => window.removeEventListener('resize', calculatePositions);
  // }, []);

  if (type === 'pip') {
    return (
      <>
        <Dialog
          open={true}
          hideBackdrop
          disableEnforceFocus
          disableScrollLock
          style={{ pointerEvents: 'none' }}
          PaperProps={{ style: { pointerEvents: 'auto' } }}
          PaperComponent={(props: PaperProps) => (
            <Draggable
              nodeRef={nodeRef}
              handle=".handle"
              bounds="parent"
              defaultPosition={videoPosition}
            >
              <Card ref={nodeRef} {...props} sx={{ borderRadius: 2, height: '400px', width: '500px' }}></Card>
            </Draggable>
          )}
        >
          <VideoRoomContainer type={type} setType={setType}>
            {children}
          </VideoRoomContainer>

        </Dialog>
        <Box sx={{ height: '424px' }} />
      </>
    );
  }

  if (type === 'fullscreen') {
    return (
      <Dialog fullScreen open={true}>
        <Box
          sx={{
            display: 'flex',
            flex: 1,
          }}
        >
          <VideoRoomContainer type={type} setType={setType}>
            {children}
          </VideoRoomContainer>
        </Box>
        <Divider />
        <AppointmentFooter />
      </Dialog>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 3 }}>
      <Card elevation={0} sx={{ borderRadius: 2 }}>
        <VideoRoomContainer type={type} setType={setType}>
          <Box sx={{ height: '400px' }}>{children}</Box>
        </VideoRoomContainer>
      </Card>
    </Container>
  );
};

const VideoRoomContainer: FC<
  PropsWithChildren<{
    type: LayoutType;
    setType: (type: LayoutType) => void;
  }>
> = (props) => {
  const { type, setType, children } = props;

  const theme = useTheme();

  return (
    <Box
      sx={{
        backgroundColor: theme.palette.primary.dark,
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
      }}
    >
      <Box sx={{ p: 1, display: 'flex', gap: 1, cursor: type === 'pip' ? 'move' : 'default' }} className="handle">
        <IconButtonContained
          size="small"
          variant={type === 'pip' ? 'disabled' : undefined}
          onClick={() => setType('pip')}
          sx={{
            color: type === 'pip' ? theme.palette.primary.dark : theme.palette.primary.contrastText,
          }}
        >
          <PictureInPictureIcon fontSize="small" />
        </IconButtonContained>
        <IconButtonContained
          size="small"
          variant={type === 'pinned' ? 'disabled' : undefined}
          onClick={() => setType('pinned')}
          sx={{
            color: type === 'pinned' ? theme.palette.primary.dark : theme.palette.primary.contrastText,
          }}
        >
          <PushPinIcon fontSize="small" />
        </IconButtonContained>
        <IconButtonContained
          size="small"
          variant={type === 'fullscreen' ? 'disabled' : undefined}
          onClick={() => setType('fullscreen')}
          sx={{
            color: type === 'fullscreen' ? theme.palette.primary.dark : theme.palette.primary.contrastText,
          }}
        >
          <OpenInFullIcon fontSize="small" />
        </IconButtonContained>
      </Box>

      <Box sx={{ backgroundColor: '#1A093B', height: '100%' }}>{children}</Box>
    </Box>
  );
};
