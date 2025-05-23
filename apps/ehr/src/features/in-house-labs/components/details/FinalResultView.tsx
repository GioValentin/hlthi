import React, { useState } from 'react';
import { Box, Paper, Typography, Button, Chip } from '@mui/material';
import { InHouseLabDTO, ResultEntryInput } from 'utils';
import { ResultEntryRadioButton } from './ResultEntryRadioButton';
import { ResultEntryTable } from './ResultsEntryTable';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { useForm, FormProvider } from 'react-hook-form';
import { InHouseLabOrderHistory } from './InHouseLabOrderHistory';
import { BiotechOutlined } from '@mui/icons-material';

interface FinalResultViewProps {
  testDetails: InHouseLabDTO;
  onBack: () => void;
}

export const FinalResultView: React.FC<FinalResultViewProps> = ({ testDetails, onBack }) => {
  const openPdf = (): void => {
    if (testDetails.resultsPDFUrl) {
      window.open(testDetails.resultsPDFUrl, '_blank');
    }
  };
  const [showDetails, setShowDetails] = useState(false);

  const radioResultMap = testDetails.labDetails.components.radioComponents.reduce((acc: any, item) => {
    if (item.result?.entry) acc[item.observationDefinitionId] = item.result.entry;
    return acc;
  }, {});
  const tableResultMap = testDetails.labDetails.components.groupedComponents.reduce((acc: any, item) => {
    if (item.result?.entry) acc[item.observationDefinitionId] = item.result.entry;
    return acc;
  }, {});
  const methods = useForm<ResultEntryInput>({
    defaultValues: { ...radioResultMap, ...tableResultMap },
  });

  return (
    <FormProvider {...methods}>
      <Box>
        <Typography variant="body1" sx={{ mb: 2, fontWeight: 'medium' }}>
          {testDetails.diagnosis}
        </Typography>

        <Paper sx={{ mb: 2 }}>
          <Box sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h5" color="primary.dark" fontWeight="bold">
                {testDetails.name}
              </Typography>
              <Chip
                label="FINAL"
                sx={{
                  color: '#1976D2',
                  bgcolor: '#E6F4FF',
                  fontWeight: 'bold',
                  borderRadius: '4px',
                  height: '24px',
                }}
              />
            </Box>
            {testDetails.labDetails.components.radioComponents.map((component) => {
              return <ResultEntryRadioButton testItemComponent={component} disabled={true} />;
            })}

            {testDetails.labDetails.components.groupedComponents.length > 0 && (
              <ResultEntryTable
                testItemComponents={testDetails.labDetails.components.groupedComponents}
                disabled={true}
              />
            )}
            <Box display="flex" justifyContent="space-between" mt={2} mb={3}>
              <Button
                variant="outlined"
                color="primary"
                sx={{ borderRadius: '50px', textTransform: 'none' }}
                onClick={() => openPdf()}
                startIcon={<BiotechOutlined />}
              >
                Results PDF
              </Button>
              <Button
                variant="text"
                color="primary"
                onClick={() => setShowDetails(!showDetails)}
                endIcon={showDetails ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
              >
                Details
              </Button>
            </Box>
            <InHouseLabOrderHistory showDetails={showDetails} testDetails={testDetails} />
          </Box>
        </Paper>
        <Box display="flex" justifyContent="space-between" alignItems="center" mt={3}>
          <Button variant="outlined" onClick={onBack} sx={{ borderRadius: '50px', px: 4 }}>
            Back
          </Button>
        </Box>
      </Box>
    </FormProvider>
  );
};
