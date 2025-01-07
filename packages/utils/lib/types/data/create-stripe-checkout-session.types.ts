export interface CreateStripeCheckoutSessionResponse {
  id: string;
  url: string;
}

export interface CreateStripeCheckoutSessionItem {
  adjustable_quantity?: {
    enabled?: boolean,
    maximum?: number,
    minimum?: number
  },
  price_data: {
    product: string
  },
  quantity: number
}


export interface CreateStripeCheckoutSessionRequestParams {
  mode: 'setup' | 'payment' | 'subscription';
  items: Array<CreateStripeCheckoutSessionItem>;
  customerId: string;
  return_url: string;
  success_url: string;
}