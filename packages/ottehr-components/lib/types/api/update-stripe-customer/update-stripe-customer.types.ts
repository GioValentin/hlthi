
export interface UpdateStripeCustomerRequestParams {
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  dob: string;
  patientId: string;
  address: {
      address?: string,
      addressLine2?: string,
      city?: string,
      state?: string,
      postalCode?: string
  }
}

export interface UpdateStripeCustomerResponse {
  customer: object
}