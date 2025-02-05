import React, { FC } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { getSelectors } from '../../../../shared/store/getSelectors';
import { useAppointmentStore } from '../../../state';
import { MessageCard } from './MessageCard';
// import { AddendumCard } from './AddendumCard';
// import { VisitNoteCard } from './VisitNoteCard';
// import { ReviewAndSignButton } from './ReviewAndSignButton';

export const MessageTab: FC = () => {
  const { isChartDataLoading, isReadOnly } = getSelectors(useAppointmentStore, ['isChartDataLoading', 'isReadOnly']);

  if (isChartDataLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
      }}
    >
      <MessageCard/>
    </Box>
  );
};
