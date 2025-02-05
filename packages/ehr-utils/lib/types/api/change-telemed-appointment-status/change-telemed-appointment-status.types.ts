import { Secrets } from '../../common.types';
import { TelemedCallStatuses } from '../../appointment.types';

export interface ChangeTelemedAppointmentStatusInput {
  appointmentId: string;
  newStatus: TelemedCallStatuses;
  chat?: boolean | null
  secrets: Secrets | null;
}

export interface ChangeTelemedAppointmentStatusResponse {
  message: string;
}
