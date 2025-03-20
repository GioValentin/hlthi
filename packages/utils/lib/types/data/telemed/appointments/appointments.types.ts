import { FileURLs } from '../../../common';
import { PatientInfo } from './create-appointment.types';
import { AnswerOptionSource } from '../../paperwork';
export interface CancelAppointmentRequestParams {
  appointmentID: string;
  cancellationReason: string;
}

export interface UpdateAppointmentRequestParams {
  appointmentId: string;
  patient: PatientInfo;
  unconfirmedDateOfBirth?: string;
  locationState?: string;
}

export interface UpdateAppointmentResponse {
  appointmentId: string;
}

export interface GetTelemedAppointmentsRequest {
  patientId?: string;
}

export interface GetTelemedAppointmentsResponse {
  appointments: TelemedAppointmentInformationIntake[];
}

export interface GetVisitDetailsRequest {
  appointmentId: string;
}

export interface GetAnswerOptionsRequest {
  answerSource?: AnswerOptionSource;
  valueSet?: string;
}

export interface PrescribedMedication {
  resourceId?: string;
  name?: string;
  instructions?: string;
}

export interface GetVisitDetailsResponse {
  files: FileURLs;
  medications: PrescribedMedication[];
  charge: {
    amount: number;
    currency: string;
    date: string;
  };
}

export interface PaymentDataResponse {
  chargeuuid: string;
  amount: number;
  currency: string;
  date: string;
  card: {
    id: string;
    brand: string;
    lastFour: string;
    expirationMonth: number;
    expirationYear: number;
  };
}

export interface TelemedAppointmentInformationIntake {
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
  state?: { code?: string; id?: string };
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

export type TelemedCallStatuses = `${TelemedAppointmentStatus}`;
export const TelemedCallStatusesArr = ['ready', 'pre-video', 'on-video', 'unsigned', 'complete', 'cancelled'];

export interface TelemedStatusHistoryElement {
  start?: string;
  end?: string;
  status?: TelemedCallStatuses;
}

export enum AppointmentVisitTabs {
  'hpi' = 'hpi',
  'exam' = 'exam',
  'erx' = 'erx',
  'plan' = 'plan',
  'sign' = 'sign',
}

export enum ApptTelemedTab {
  'ready' = 'ready',
  'provider' = 'provider',
  'not-signed' = 'not-signed',
  'complete' = 'complete',
}
