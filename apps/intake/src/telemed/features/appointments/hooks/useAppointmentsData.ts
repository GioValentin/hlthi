import { useState, useEffect } from 'react';
import { getSelectors, TelemedAppointmentInformationIntake } from 'utils';
import { useAppointmentStore, useGetAppointments } from '..';
import { useZapEHRAPIClient } from '../../../utils';

export const useAppointmentsData = (): {
  appointmentID: string | undefined;
  appointment: TelemedAppointmentInformationIntake | undefined;
  appointments: TelemedAppointmentInformationIntake[] | undefined;
  isAppointmentsFetching: boolean;
  refetchAppointments: () => Promise<unknown>;
} => {
  const apiClient = useZapEHRAPIClient();
  const [appointment, setCurrentAppointment] = useState<TelemedAppointmentInformationIntake | undefined>();
  const { appointmentID } = getSelectors(useAppointmentStore, ['appointmentID']);

  const {
    data: { appointments } = {},
    isFetching: isAppointmentsFetching,
    refetch: refetchAppointments,
  } = useGetAppointments(apiClient, Boolean(apiClient));

  useEffect(() => {
    const appointment = appointments?.find?.((appointment) => {
      return appointment.id === appointmentID;
    });
    setCurrentAppointment(appointment);
  }, [appointments, appointmentID]);

  return {
    appointmentID,
    appointment,
    appointments,
    isAppointmentsFetching,
    refetchAppointments,
  };
};
