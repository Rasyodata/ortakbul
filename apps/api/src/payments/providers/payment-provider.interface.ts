export interface CheckoutBuyer {
  id: string;
  name: string;
  surname: string;
  email: string;
  phone?: string;
  identityNumber?: string;
  city?: string;
  country?: string;
  address?: string;
}

export interface CheckoutParams {
  paymentId: string;
  amount: number; // kuruş
  currency: string;
  description: string;
  callbackUrl: string;
  buyer: CheckoutBuyer;
  itemName: string;
}

export interface CheckoutResult {
  provider: string;
  redirectUrl?: string;
  token?: string;
  raw?: any;
}

export interface WebhookResult {
  paymentId: string;
  success: boolean;
  providerRef?: string;
}

// Tüm ödeme sağlayıcıları bu arayüzü uygular (iyzico / PayTR / Stripe).
export interface PaymentProvider {
  readonly name: string;
  createCheckout(params: CheckoutParams): Promise<CheckoutResult>;
  parseWebhook(payload: any, headers: Record<string, any>): Promise<WebhookResult>;
}
