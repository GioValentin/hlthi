
export interface UpdateStripeCheckoutSessionRequestParams {
  id: string;
  type: string;
}

export interface UpdateStripeCheckoutSessionResponse {
  url?: string,
  deleted?: boolean
}