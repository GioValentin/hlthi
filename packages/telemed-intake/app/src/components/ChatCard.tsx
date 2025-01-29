import { Card } from '@mui/material';
import { FC, useEffect, useState, useRef } from 'react';
import { useAppointmentStore } from '../features/appointments';
import { LoadingSpinner } from './LoadingSpinner';

export const ChatCard: FC = () => {
  const [chatUrl, setChatUrl] = useState<string | null>(null);
  const chatRef = useRef<string | null>(null);

  // Access `chat` from the store
  const { chat } = useAppointmentStore.getState();

  useEffect(() => {
    // Only update if `chat` changes and is different from the cached value
    if (chat && chat !== chatRef.current) {
      setChatUrl(chat);
      chatRef.current = chat; // Cache the current chat
    } else if (!chat) {
      setChatUrl(null);
      chatRef.current = null; // Reset the cache
    }
  }, [chat]);

  return (
    <Card
      sx={{
        flex: '1 auto',
        py: 5,
        px: 5,
        borderRadius: 2,
        boxShadow: 0,
        position: 'relative',
        minWidth: '347px',
        width: '100%',
        height: '900px',
        transition: 'all 0.5s',
      }}
    >
      <h2>Live Chat With Provider</h2>
      {chatUrl === null ? (
        <LoadingSpinner transparent />
      ) : (
        <iframe
          src={chatUrl}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
          }}
          title="Chat Frame"
        ></iframe>
      )}
    </Card>
  );
};
