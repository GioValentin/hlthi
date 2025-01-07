export interface CreateStripeCustomerlResponse {
    customerId: string;
  }
  
  export interface CreateStripeCustomerRequestParams {
    email: string;
    phone: string;
    firstName: string;
    lastName: string;
    dob: string;
    patientId: string;
  }
  