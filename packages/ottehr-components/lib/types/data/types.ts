export interface ApiError {
  message: string;
}

export type GetZapEHRAPIParams = {
  isAppLocal?: 'true' | 'false';
  checkInZambdaID?: string;
  createAppointmentZambdaID?: string;
  cancelTelemedAppointmentZambdaID?: string;
  cancelInPersonAppointmentZambdaID?: string;
  updateAppointmentZambdaID?: string;
  getPatientsZambdaID?: string;
  getScheduleZambdaID?: string;
  getAppointmentsZambdaID?: string;
  getPaperworkZambdaID?: string;
  createPaperworkZambdaID?: string;
  updatePaperworkZambdaID?: string;
  getWaitStatusZambdaID?: string;
  joinCallZambdaID?: string;
  videoChatCreateInviteZambdaID?: string;
  videoChatCancelInviteZambdaID?: string;
  videoChatListInvitesZambdaID?: string;
  getPresignedFileURLZambdaID?: string;
  getProvidersZambdaID?: string;
  getLocationsZambdaID?: string;
  getGroupsZambdaID?: string;
  getBillingPortalZambdaID?: string;
  getStripeCustomerZambdaID?: string;
  updateStripeCustomerZambdaID?: string;
  createStripeCheckoutSessionZambdaID?: string;
  updateStripeCheckoutSessionZambdaID?: string;
  getStripeCheckoutZambdaID?: string;
  getPatientSubscriptionStatusZambdaID?: string;
  getProviderZambdaID?: string;
  createAccountZambdaID?: string;
  createSMSVerificationZambdaID?: string;
  checkSMSVerificationZambdaID?: string;
};
