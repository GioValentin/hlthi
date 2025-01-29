
import { Box, Typography, useTheme } from '@mui/material';
import { FC, useEffect, useMemo, useState } from 'react';
import { useChatStore } from '../../state';
import { useStore } from 'zustand';

export const ChatRoom: FC = () => {
  const theme = useTheme();
    const useConversation = () => {
      return useStore(useChatStore, (state) => state.conversation);
    };

   const conversation = useConversation();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        height: '100%',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}
      >
      <Box sx={{ display: 'flex', padding: 1, gap: 1, height: '100%' }}>
        <iframe src={conversation?.link} style={{
          display: "block",
          height: "100vh",
          width: "100vw",
          border: "none"
        }}></iframe>
        
      </Box>
        
      </Box>
    </Box>
  );
};
