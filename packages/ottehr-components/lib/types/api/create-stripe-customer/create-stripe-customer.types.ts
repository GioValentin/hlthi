
export interface CreateStripeCustomerRequestParams {
  email: string,
  phone:string,
  firstName: string,
  lastName: string,
  dob: string,
  patientId: string
}

export interface CreateStripeCustomerResponse {
  customer: object
}