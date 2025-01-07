
export interface BillingPortalRequestParams {
  customerId: string
}

export interface BillingPortalResponse {
  customer: object,
  return_url: string,
  url: string
}