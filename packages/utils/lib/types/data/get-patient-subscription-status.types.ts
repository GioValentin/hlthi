export interface GetPatientSubscriptionStatusResponse {
  active: boolean;
}

export interface GetPatientSubscriptionStatusRequestParams {
  patientId?: string;
  dob?:string;
  email?: string;
}