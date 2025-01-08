
export interface BillingPortalRequestParams {
  customerId?: string
  dob?: string,
  email?: string
}

export interface BillingPortalResponse {
  customer: object,
  return_url: string,
  url: string
}