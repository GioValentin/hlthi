import { Box, CircularProgress } from '@mui/material';
import { FC } from 'react';
import { useChartData } from '../../stores/appointment/appointment.store';
import { DispositionCard } from '../DispositionCard';
import { SchoolWorkExcuseCard } from '../SchoolWorkExcuseCard';
import { ERxCard } from './ERxCard';
import { HealthwiseDocumentsCard } from './HealthwiseDocumentsCard';
import { PatientInstructionsCard } from './PatientInstructionsCard';
<<<<<<< HEAD:apps/ehr/src/telemed/features/appointment/PlanTab/PlanTab.tsx
import { SchoolWorkExcuseCard } from './SchoolWorkExcuseCard';
// import { CompoundOrderCard } from './CompoundOrderCard';
=======
>>>>>>> develop:apps/ehr/src/features/visits/shared/components/plan-tab/PlanTab.tsx

export const PlanTab: FC = () => {
  const { isChartDataLoading } = useChartData();

  if (isChartDataLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  // 1656: temporarily hide HealthwiseDocuments section
  const tmpHideHealthwiseDocuments = true;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
      }}
    >
      <ERxCard />
      {/* <CompoundOrderCard/> */}
      <PatientInstructionsCard />
      {tmpHideHealthwiseDocuments ? <></> : <HealthwiseDocumentsCard />}
      <DispositionCard />
      <SchoolWorkExcuseCard />
    </Box>
  );
};
