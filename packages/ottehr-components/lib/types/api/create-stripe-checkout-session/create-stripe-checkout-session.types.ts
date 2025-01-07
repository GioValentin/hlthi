export interface listItemForCreateStripeCheckoutSession {
  adjustable_quantity?: {
    enabled?: boolean,
    maximum?: number,
    minimum?: number
  },
  price?: string,
  price_data?: {
    currency: string,
    product: string
  },
  quantity: number
}

export interface CreateStripeCheckoutSessionRequestParams {
  patientId: string;
  email: string;
  line_items: Array<listItemForCreateStripeCheckoutSession>;
  mode: 'setup' | 'payment' | 'subscription',
  return_url: string,
  success_url: string
}

export interface CreateStripeCheckoutSessionResponse {
  url: object
}