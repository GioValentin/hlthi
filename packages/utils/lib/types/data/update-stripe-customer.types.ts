export interface UpdateStripeCustomerResponse {
    customerId: string;
}
  
export interface UpdateStripeCustomerRequestParams {
    email: string;
    phone: string;
    firstName: string;
    lastName: string;
    dob: string;
    patientId: string;
    address: {
        company?:string,
        address?: string,
        addressLine2?: string,
        city?: string,
        state?: string,
        postalCode?: string
    };
}
  