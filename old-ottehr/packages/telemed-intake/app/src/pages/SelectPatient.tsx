import { useEffect } from 'react';
import { Box, CircularProgress, Skeleton } from '@mui/material';
import { DateTime } from 'luxon';
import { FieldValues } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BoldPurpleInputLabel, PageForm } from 'ottehr-components';
import { getSelectors, getPatientInfoFullName } from 'ottehr-utils';
import { IntakeFlowPageRoute } from '../App';
import { otherColors } from '../IntakeThemeProvider';
import { useAppointmentStore } from '../features/appointments';
import { CustomContainer } from '../features/common';
import { usePaperworkStore } from '../features/paperwork';
import { usePatientInfoStore } from '../features/patient-info';
import { useGetPatients, usePatientsStore } from '../features/patients';
import { useZapEHRAPIClient } from '../utils';

const SelectPatient = (): JSX.Element => {
  const { patientInfo: currentPatientInfo, setNewPatient } = usePatientInfoStore.getState();
  const apiClient = useZapEHRAPIClient();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const urlParams = new URLSearchParams(window.location.search);
  const flow = urlParams.get('flow');
  const patientsStore = getSelectors(usePatientsStore, ['patients']);

  const { refetch, isFetching } = useGetPatients(apiClient, (data) => {
    usePatientsStore.setState({ patients: data.patients });
    if (location.state?.patientId) {
      onSubmit({ patientId: location.state.patientId });
    }
  });

  const FORM_PATIENT_ID_ELEMENT_BASE = {
    name: 'patientId',
    label: t('selectPatient.selectPatient'),
    defaultValue: '',
    required: true,
  };

  const DIFFERENT_FAMILY_MEMBER_DATA = {
    label: t('selectPatient.differentFamilyMember'),
    description: t('selectPatient.differentFamilyMemberDescription'),
    value: 'new-patient',
    color: otherColors.lightBlue,
  };

  useEffect(() => {
    if (apiClient) {
      void refetch();
    }
  }, [refetch, apiClient]);

  const onSubmit = (data: FieldValues): void => {
    const selectedPatient = patientsStore.patients?.find((patient) => patient.id === data.patientId);

    if (selectedPatient) {
      usePatientInfoStore.setState(() => ({
        patientInfo: {
          ...selectedPatient,
          id: selectedPatient.id || undefined,
          newPatient: false,
          dateOfBirth: DateTime.fromISO(selectedPatient.dateOfBirth || '').toString(),
          reasonForVisit: currentPatientInfo?.reasonForVisit,
        },
        pendingPatientInfoUpdates: undefined,
      }));
    } else {
      setNewPatient();
    }

    if (flow === 'requestVisit') {
      useAppointmentStore.setState({ appointmentDate: undefined, appointmentID: undefined });
      usePaperworkStore.setState({ paperworkQuestions: undefined, completedPaperwork: undefined });
      navigate(IntakeFlowPageRoute.PatientInformation.path);
    } else if (flow === 'continueVisitRequest') {
      usePaperworkStore.setState({ paperworkQuestions: undefined, completedPaperwork: undefined });
      navigate(IntakeFlowPageRoute.PatientInformation.path);
    } else if (flow === 'pastVisits') {
      navigate(IntakeFlowPageRoute.PastVisits.path);
    }
  };

  const onBack = (): void => {
    const redirectPath = localStorage.getItem('welcomePath');
    if (redirectPath) {
      navigate(redirectPath);
    } else {
      navigate(IntakeFlowPageRoute.PatientPortal.path);
    }
  };

  if (location.state?.patientId) {
    return (
      <CustomContainer
        title={t('selectPatient.loadingPatient')}
        description=""
        bgVariant={IntakeFlowPageRoute.PatientPortal.path}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      </CustomContainer>
    );
  }

  return (
    <CustomContainer
      title={t('selectPatient.selectPatient')}
      description=""
      bgVariant={IntakeFlowPageRoute.PatientPortal.path}
    >
      {isFetching ? (
        <Box sx={{ pt: 2 }}>
          <BoldPurpleInputLabel shrink>{t('selectPatient.selectPatient')} *</BoldPurpleInputLabel>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {Array(3)
              .fill(0)
              .map((_, i) => (
                <Skeleton
                  key={i}
                  variant="rounded"
                  height={80}
                  sx={{
                    borderRadius: 2,
                    backgroundColor: otherColors.coachingVisit,
                  }}
                />
              ))}
          </Box>
        </Box>
      ) : (
        <PageForm
          formElements={[
            {
              type: 'Radio',
              ...FORM_PATIENT_ID_ELEMENT_BASE,
              defaultValue: currentPatientInfo.id || FORM_PATIENT_ID_ELEMENT_BASE.defaultValue || 'new-patient',
              radioOptions: (patientsStore.patients || [])
                .map((patient) => {
                  if (!patient.id) {
                    throw new Error('Patient id is not defined');
                  }
                  return {
                    label: getPatientInfoFullName(patient),
                    description: t('general.patientBirthday', {
                      formattedPatientBirthDay: DateTime.fromFormat(patient.dateOfBirth || '', 'yyyy-MM-dd').toFormat(
                        'MMMM dd, yyyy',
                      ),
                    }),
                    value: patient.id,
                    color: otherColors.lightBlue,
                  };
                })
                .concat(flow !== 'pastVisits' ? DIFFERENT_FAMILY_MEMBER_DATA : []),
            },
          ]}
          onSubmit={onSubmit}
          controlButtons={{ onBack }}
        />
      )}
    </CustomContainer>
  );
};

export default SelectPatient;
