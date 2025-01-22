import { Box } from '@mui/material';
import { FC, useCallback, useState } from 'react';
import { getSelectors } from '../../../../shared/store/getSelectors';
import { AccordionCard } from '../../../components';
import { useAppointmentStore } from '../../../state';
import { ERX } from '../ERX';
import { PrescribedMedicationReviewItem } from '../ReviewTab/components/PrescribedMedicationReviewItem';
import { RoundedButton } from '../../../../components/RoundedButton';
import { useGetAppointmentAccessibility } from '../../../hooks';

export const ERxCard: FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { chartData } = getSelectors(useAppointmentStore, ['chartData']);
  const { isAppointmentReadOnly: isReadOnly } = useGetAppointmentAccessibility();

  const [isERXOpen, setIsERXOpen] = useState(false);
  const [isERXLoading, setIsERXLoading] = useState(false);

  const handleERXLoadingStatusChange = useCallback<(status: boolean) => void>(
    (status) => setIsERXLoading(status),
    [setIsERXLoading]
  );

  return (
    <AccordionCard label="RX" collapsed={collapsed} onSwitch={() => setCollapsed((prevState) => !prevState)}>
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {(chartData?.prescribedMedications?.length || -1) >= 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
            {chartData?.prescribedMedications?.map((med) => (
              <PrescribedMedicationReviewItem medication={med} key={med.resourceId || med.name} />
            ))}
          </Box>
        )}
        <RoundedButton disabled={isReadOnly || isERXLoading} variant="contained" onClick={() => setIsERXOpen(true)}>
          Add RX
        </RoundedButton>
      </Box>
      {isERXOpen && <ERX onClose={() => setIsERXOpen(false)} onLoadingStatusChange={handleERXLoadingStatusChange} />}
    </AccordionCard>
  );
};
