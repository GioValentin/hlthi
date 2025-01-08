export interface GetStripeSubscriptionRequestParams {
  patientId?: string
  dob?: string,
  email?: string
}

export interface GetStripeSubscriptionStatusResponse {
  active: boolean
}