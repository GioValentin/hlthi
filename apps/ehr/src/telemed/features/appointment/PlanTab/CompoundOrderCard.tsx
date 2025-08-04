import AddIcon from '@mui/icons-material/Add';
import DoneIcon from '@mui/icons-material/Done';
import { Box, TextField, Typography, Select, MenuItem, InputLabel } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import React, { FC, useCallback, useMemo, useState } from 'react';
import { CommunicationDTO, PROJECT_NAME } from 'utils';
import { RoundedButton } from '../../../../components/RoundedButton';
import { getSelectors } from '../../../../shared/store/getSelectors';
import { AccordionCard, ActionsList, DeleteIconButton } from '../../../components';
import { useChartDataArrayValue, useGetAppointmentAccessibility } from '../../../hooks';
import { ExtractObjectType, useAppointmentStore, useDeleteChartData, useGetMedicationsSearch, useSaveChartData, useSavePatientInstruction } from '../../../state';
import { PatientInstructionsTemplatesDialog } from './components';
import { MedicationDTO } from 'utils';
import { text } from 'stream/consumers';
import { useMedicationHistory } from '@features/css-module/hooks/useMedicationHistory';
import { useForm } from 'react-hook-form';
import { debounce } from 'lodash';
import { ErxSearchMedicationsResponse } from '@oystehr/sdk';
import { DateTime } from 'luxon';
import { createCompoundOrder } from '@api/api';
import { useApiClients } from '@hooks/useAppClients';
interface CurrentMedicationsProviderColumnForm {
  medication: ExtractObjectType<ErxSearchMedicationsResponse> | null;
  type: MedicationDTO['type'];
  date: DateTime | null;
  dose: string | null;
}

export const CompoundOrderCard: FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [myTemplatesOpen, setMyTemplatesOpen] = useState(false);
  const [defaultTemplatesOpen, setDefaultTemplatesOpen] = useState(false);
  const {oystehrZambda} = useApiClients()
  const [instruction, setInstruction] = useState('');
  const [medication, setMedication] = useState<MedicationDTO|undefined>(undefined);

  const { mutate: savePatientInstruction, isLoading: isSavePatientInstructionLoading } = useSavePatientInstruction();
  const { mutate: saveChartData, isLoading: isSaveChartDataLoading } = useSaveChartData();
  const { mutate: deleteChartData } = useDeleteChartData();

  const methods = useForm<CurrentMedicationsProviderColumnForm>({
    defaultValues: { medication: null, dose: null, date: null, type: 'scheduled' },
  });
  const { isChartDataLoading, appointment, practitioner } = getSelectors(useAppointmentStore, ['isChartDataLoading', 'appointment', 'practitioner']);
  const { isAppointmentReadOnly: isReadOnly } = useGetAppointmentAccessibility();

  const { control, reset, handleSubmit } = methods;

  const { refetchHistory } = useMedicationHistory();

  const {
    onSubmit,
    onRemove,
    values: medications,
  } = useChartDataArrayValue(
    'medications',
    undefined,
    {
      _sort: '-_lastUpdated',
      _include: 'MedicationStatement:source',
      status: { type: 'token', value: 'active' },
    },
    refetchHistory
  );

  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  const { isFetching: isSearching, data } = useGetMedicationsSearch(debouncedSearchTerm);
  const medSearchOptions = data || [];


  const handleFormSubmitted = async (data: CurrentMedicationsProviderColumnForm): Promise<void> => {
    if (data) {
      const success = await onSubmit({
        name: `${data.medication?.name}${data.medication?.strength ? ` (${data.medication?.strength})` : ''}`,
        id: data.medication?.id?.toString(),
        type: data.type,
        intakeInfo: {
          date: data.date?.toUTC().toString(),
          dose: data.dose ?? undefined,
        },
        status: 'active',
      });
      if (success) {
        reset({ medication: null, date: null, dose: null, type: 'scheduled' });
        void refetchHistory();
      }
    }
  };

  const isLoading = isSavePatientInstructionLoading || isSaveChartDataLoading;

  const { chartData, setPartialChartData } = getSelectors(useAppointmentStore, ['chartData', 'setPartialChartData']);
  const instructions = chartData?.instructions || [];
  const medications_ = chartData?.medications || [];
  const [orderedRx, setOrderRx] = useState<boolean>(false);
  const [orderingRx, setOrderingRx] = useState<boolean>(false);

  const [lineItems, setLineItems] = useState<MedicationDTO[]>([]);

  const onAdd = (): void => {
    const localInstructions = [...instructions, { text: instruction }];
    const localMedications = [...medications_, medication];
    const localLineitems = [...lineItems, medication];

    //@ts-ignore
    setLineItems(prev => prev ? [...prev, medication] : [medication]);

    setPartialChartData({
      instructions: localInstructions,
      //@ts-ignore
      medications: localMedications,
    });

    saveChartData(
      {
        instructions: [{ text: instruction }],
        medications: [{
        //@ts-ignore
        name: `${medication?.name}${medication?.strength ? ` (${medication?.strength})` : ''}`,
        id: medication?.id?.toString(),
        type: 'scheduled',
        intakeInfo: {
          date: DateTime.now().toUTC().toString(),
          //@ts-ignore
          dose: medication?.dose ?? undefined,
        },
        status: 'active',
      }]
      },
      {
        onSuccess: (data) => {
          const instruction = (data?.chartData?.instructions || [])[0];
          const medication = (data?.chartData?.medications || [])[0];

          if (instruction) {
            setPartialChartData({
              instructions: localInstructions.map((item) => (item.resourceId ? item : instruction)),
            });
          }

          if (medication) {
            setPartialChartData({
                //@ts-ignore
              medications: localMedications.map((item) => (item.resourceId ? item : medication)),
            });

            // @ts-ignore
            setLineItems(localLineitems.map((item) => (item.resourceId ? item : medication)));
          }
        },
        onError: () => {
          enqueueSnackbar('An error has occurred while adding patient compound medication. Please try again.', {
            variant: 'error',
          });
          setPartialChartData({ instructions });
          setPartialChartData({medications});
          
          setMedication(medication);
          setInstruction(instruction);
        },
      }
    );

    setInstruction('');
    setMedication(undefined);

  };

  const onDelete = (value:MedicationDTO): void => {
    
    setPartialChartData({
      medications: medications_.filter((item) => {return item.resourceId !== value.resourceId})
    });


    setLineItems( 
        lineItems?.filter((item) => {return item.resourceId !== value.resourceId})
    );


    deleteChartData(
      {
        medications: [value]
      },
      {
        onError: () => {
          enqueueSnackbar('An error has occurred while deleting patient instruction. Please try again.', {
            variant: 'error',
          });
          setPartialChartData({ medications });
        }
      }
    );
  };

  const orderRx = (): void => {

    if(oystehrZambda == undefined) return;
    
    setOrderingRx(true);

    enqueueSnackbar('The compound order has been sent!', {
        variant: 'success',
    });

    createCompoundOrder({
        practitioner: practitioner,
        appointmentId: appointment?.id,
        lineItems: lineItems
    }, oystehrZambda).then((data) => {

        console.log(data);
    });

  };


  // Southend treatment protocol options
const options = [
  {
    value: 'COMP-tirzepatide-new-patient-90-days',
    label: 'Medical Weight Loss - Tirzepatide/Pyridoxine (90‑day: 2.2 → 4.4 → 6.6 mg weekly)',
    medicationName: 'Tirzepatide/Pyridoxine',
    strength: '22 mg‑4 mg/mL',
    dose: '2.2 → 4.4 → 6.6 mg subcutaneously weekly',
    instructions: `
Weeks 1–4: Inject 2.2 mg (10 units) SC once weekly  
Weeks 5–8: Inject 4.4 mg (20 units) SC once weekly  
Weeks 9–12: Inject 6.6 mg (30 units) SC once weekly  
Discard any remaining solution after each injection.
    `.trim(),
    priceCents: 100000 // base price not found in uploads
  },
  {
    value: 'COMP-tirzepatide-30-day-2-2mg-weekly',
    label: 'Medical Weight Loss - Tirzepatide/Pyridoxine (30‑day: 2.2 mg weekly)',
    medicationName: 'Tirzepatide/Pyridoxine',
    strength: '22 mg‑4 mg/mL',
    dose: '2.2 mg subcutaneously weekly',
    instructions: `Inject 2.2 mg (10 units) SC weekly (total 8.8 mg/month). Discard any remaining.`,
    priceCents: 39600, // base $360 :contentReference[oaicite:12]{index=12} → 360 * 1.10 = 396
  },
  {
    value: 'COMP-tirzepatide-30-day-6-6mg-weekly',
    label: 'Medical Weight Loss - Tirzepatide/Pyridoxine (30‑day: 6.6 mg weekly)',
    medicationName: 'Tirzepatide/Pyridoxine',
    strength: '22 mg‑4 mg/mL',
    dose: '6.6 mg subcutaneously weekly',
    instructions: `Inject 6.6 mg (30 units) SC weekly (total 26.4 mg/month). Discard any remaining.`,
    priceCents: 79200, // base $720 :contentReference[oaicite:13]{index=13} → 720 * 1.10 = 792
  },
  {
    value: 'COMP-tirzepatide-month-4-8-8mg-weekly',
    label: 'Medical Weight Loss - Tirzepatide/Pyridoxine (4 mg wk 4: 8.8 mg weekly)',
    medicationName: 'Tirzepatide/Pyridoxine',
    strength: '22 mg‑4 mg/mL',
    dose: '8.8 mg subcutaneously weekly',
    instructions: `Inject 8.8 mg (40 units) SC weekly (total 35.2 mg/month). Discard any remaining.`,
    priceCents: 79200, // same 6‑vial pack $720 :contentReference[oaicite:14]{index=14}
  },
  {
    value: 'COMP-tirzepatide-month-5-11mg-weekly',
    label: 'Medical Weight Loss - Tirzepatide/Pyridoxine (5 mg wk 5: 11 mg weekly)',
    medicationName: 'Tirzepatide/Pyridoxine',
    strength: '22 mg‑4 mg/mL',
    dose: '11 mg subcutaneously weekly',
    instructions: `Inject 11 mg (50 units) SC weekly (total 44 mg/month). Discard any remaining.`,
    priceCents: 79200, // still the $720 6‑vial pack :contentReference[oaicite:15]{index=15}
  },
  {
    value: 'COMP-tirzepatide-maintenance-13-2mg-weekly',
    label: 'Medical Weight Loss - Tirzepatide/Pyridoxine (Maintenance: 13.2 mg weekly)',
    medicationName: 'Tirzepatide/Pyridoxine',
    strength: '22 mg‑4 mg/mL',
    dose: '13.2 mg subcutaneously weekly',
    instructions: `Inject 13.2 mg (60 units) SC weekly (total 52.8 mg/month). Discard any remaining.`,
    priceCents: 99000, // base $900 :contentReference[oaicite:16]{index=16} → 900 * 1.10 = 990
  },
  {
    value: 'COMP-semaglutide-new-patient-90-days',
    label: 'Medical Weight Loss - Semaglutide/Pyridoxine (90‑day: 0.21 → 0.4 → 0.88 mg weekly)',
    medicationName: 'Semaglutide/Pyridoxine',
    strength: '1.5 mg‑8 mg/mL → 5 mg‑8 mg/mL',
    dose: '0.21 → 0.4 → 0.88 mg subcutaneously weekly',
    instructions: `
Month 1 (Weeks 1–4): 0.21 mg weekly  
Month 2 (Weeks 5–8): 0.4 mg weekly  
Month 3 (Weeks 9–12): 0.88 mg weekly  
Discard any remaining after each injection.
    `.trim(),
    priceCents: 19800, // base $180 :contentReference[oaicite:17]{index=17} → 180 * 1.10 = 198
  },
  {
    value: 'COMP-semaglutide-3mo-15mg-0-4mg',
    label: 'Medical Weight Loss - Semaglutide/Pyridoxine (3 mo: 15 mg total, 0.4 mg weekly)',
    medicationName: 'Semaglutide/Pyridoxine',
    strength: '5 mg‑8 mg/mL',
    dose: '0.4 mg subcutaneously weekly',
    instructions: `Inject 0.4 mg (8 units) SQ weekly (total 1.6 mg/month). Discard any remaining.`,    
    priceCents: 24750, // base $225 :contentReference[oaicite:18]{index=18} → 225 * 1.10 = 247.5
  },
  {
    value: 'COMP-semaglutide-3mo-15mg-0-88mg',
    label: 'Medical Weight Loss - Semaglutide/Pyridoxine (3 mo: 30 mg total, 0.88 mg weekly)',
    medicationName: 'Semaglutide/Pyridoxine',
    strength: '5 mg‑8 mg/mL',
    dose: '0.88 mg subcutaneously weekly',
    instructions: `Inject 0.88 mg (18 units) SQ weekly (total 3.52 mg/month). Discard any remaining.`,
    priceCents: 47850, // base $435 :contentReference[oaicite:19]{index=19} → 435 * 1.10 = 478.5
  },
  {
    value: 'COMP-sermorelin-bedtime-0-3mg-28d',
    label: 'Sermorelin 3 mg/mL Multi‑Dose Vial (28 day supply: 0.3 mg nightly)',
    medicationName: 'Sermorelin',
    strength: '3 mg/mL',
    dose: '0.3 mg subcutaneously at bedtime for 28 days',
    instructions: `Inject 0.3 mg (10 units) SC nightly for 28 days. Discard any remaining.`,
    priceCents: 13750, // base $125 :contentReference[oaicite:20]{index=20} → 125 * 1.10 = 137.5
  },
  {
    value: 'COMP-nad-weekly-50mg-1vial',
    label: 'NAD+ 200 mg/mL Multi‑Dose Vial (2 mL = 1 vial; 50 mg weekly)',
    medicationName: 'NAD+',
    strength: '200 mg/mL',
    dose: '50 mg subcutaneously weekly for 4 weeks',
    instructions: `Inject 50 mg (0.25 mL/25 units) SC weekly for 4 weeks. Discard any remaining.`,
    priceCents: 10999, // base $99.99 :contentReference[oaicite:21]{index=21} → 99.99 * 1.10 ≈ 109.99
  },
  {
    value: 'COMP-nad-weekly-100mg-1vial',
    label: 'NAD+ 200 mg/mL Multi‑Dose Vial (2 mL = 1 vial; 100 mg weekly)',
    medicationName: 'NAD+',
    strength: '200 mg/mL',
    dose: '100 mg subcutaneously weekly for 4 weeks',
    instructions: `Inject 100 mg (0.5 mL/50 units) SC weekly for 4 weeks. Discard any remaining.`,
    priceCents: 10999, // same 1‑vial pack $99.99 :contentReference[oaicite:22]{index=22}
  },
  {
    value: 'COMP-nad-twice-weekly-escalation',
    label: 'NAD+ 200 mg/mL Multi‑Dose Vial (4 mL = 2 vials; twice‑weekly escalation)',
    medicationName: 'NAD+',
    strength: '200 mg/mL',
    dose: '50 → 100 mg subcutaneously twice weekly over 4 weeks',
    instructions: `
Week 1–2: Inject 50 mg twice weekly  
Week 3–4: Inject 100 mg twice weekly  
Discard any remaining.
    `.trim(),
    priceCents: 21998, // base $199.98 :contentReference[oaicite:23]{index=23} → 199.98 * 1.10 ≈ 219.98
  },
];



  return (
    <>
      <AccordionCard
        label="Medical Weight Loss, TRT, HRT Rx Orders Only"
        collapsed={collapsed}
        onSwitch={() => setCollapsed((prevState) => !prevState)}
      >
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {!isReadOnly && (
            <>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                <Select
                    labelId="protocol-select-label"
                    value={medication?.name}
                    // show the empty value even after the label shrinks
                    displayEmpty
                    fullWidth
                    // if you want custom placeholder rendering
                    renderValue={(selected) => {
                        if (!selected) {
                            return <em>Please choose treatment protocol</em>;
                        }
                        // otherwise find the label text
                        const found = options.find((o) => o.value === selected);
                        
                        return found ? found.label : selected;
                    }}
                    onChange={(e) => {

                         const picked = options.find((opt) => opt.value === e.target.value);

                        setInstruction(picked?.instructions!);
                        setMedication({
                            name: picked?.label!,
                            //@ts-ignore
                            strength: picked?.strength,
                            dose: picked?.dose,
                            priceCents: picked?.priceCents,
                            id: e.target.value
                        });

                    }}
                    >
                        {/* disabled placeholder item */}
                        <MenuItem key="FIRST" value="" disabled>
                        <em>Please choose treatment protocol</em>
                        </MenuItem>

                        {options.map((opt) => (

                            <MenuItem key={opt.value} value={opt.value}>
                                {opt.label}
                            </MenuItem>
                        ))}
                </Select>
            
                <RoundedButton onClick={onAdd} disabled={!instruction.trim() || isLoading} startIcon={<AddIcon />}>
                  Add
                </RoundedButton>
              </Box>
            </>
          )}

          {lineItems.length > 0 && (
            <ActionsList
              data={lineItems}
              getKey={(value, index) => value.resourceId || index}
              renderItem={(value) => <Typography>{value.name}</Typography>}
              renderActions={
                isReadOnly
                  ? undefined
                  : (value) => <DeleteIconButton disabled={!value.resourceId} onClick={() => onDelete(value)} />
              }
              divider
              gap={1}
            />
          )}

          {medications.length === 0 && isReadOnly && (
            <Typography color="secondary.light">No patient compounds ordered</Typography>
          )}
            {lineItems?.length !== 0 && (
                <RoundedButton onClick={orderRx} disabled={orderingRx} startIcon={<AddIcon />}>
                    Send Compound Order
                </RoundedButton>
            )}
            
        </Box>
      </AccordionCard>
    </>
  );
};
