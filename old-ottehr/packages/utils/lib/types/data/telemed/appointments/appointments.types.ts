import { PatientInfo } from './create-appointment.types';

export interface CancelAppointmentRequestParams {
  appointmentID: string;
  cancellationReason: string;
}

export interface UpdateAppointmentRequestParams {
  appointmentId: string;
  patient: PatientInfo;
  unconfirmedDateOfBirth?: boolean;
}

export interface UpdateAppointmentResponse {
  appointmentId: string;
}

export interface GetTelemedAppointmentsRequest {
  patientId?: string;
}

export interface GetTelemedAppointmentsResponse {
  appointments: TelemedAppointmentInformation[];
}

export interface TelemedAppointmentInformation {
  id: string;
  start?: string;
  patient: {
    id?: string;
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string;
  };
  appointmentStatus: string;
  telemedStatus: TelemedAppointmentStatus;
}

export enum TelemedAppointmentStatusEnum {
  'ready' = 'ready',
  'pre-video' = 'pre-video',
  'on-video' = 'on-video',
  'unsigned' = 'unsigned',
  'complete' = 'complete',
  'cancelled' = 'cancelled',
}

export type TelemedAppointmentStatus = `${TelemedAppointmentStatusEnum}`;
