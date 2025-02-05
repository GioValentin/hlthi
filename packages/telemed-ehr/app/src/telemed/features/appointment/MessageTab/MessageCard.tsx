import React, { FC } from 'react';
import { Box, Typography, Link } from '@mui/material';
import { AccordionCard } from '../../../components';
import { useStore } from 'zustand';
import { useAppointmentStore, useChatStore } from '../../../state';
import { getSelectors } from '../../../../shared/store/getSelectors';

export const MessageCard: FC = () => {
  const { conversationEncounter } = getSelectors(useAppointmentStore, ['conversationEncounter']);

  const useConversation = () => {
    return useStore(useChatStore, (state) => state.conversation);
  };

  const conversation = useConversation();

  if (!conversationEncounter.id || conversation?.link == undefined) {
    return null;
  }


  return (
    <AccordionCard label="Conversation">
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'start' }}>
        <Typography>
          Current Message With Patients
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <iframe src={conversation?.link} style={{
                display: "block",
                height: "100vh",
                width: "65vw",
                border: "none"
            }}></iframe>
        </Box>
      </Box>
    </AccordionCard>
  );
};
