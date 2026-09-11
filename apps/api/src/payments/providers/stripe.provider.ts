import { CheckoutParams, CheckoutResult, PaymentProvider, WebhookResult } from './payment-provider.interface';

// Stripe adaptörü (global). Production'da Stripe Checkout Session + webhook imza doğrulama.
export class StripeProvider implements PaymentProvider {
  readonly name = 'stripe';

  async createCheckout(p: CheckoutParams): Promise<CheckoutResult> {
    // TODO(production): stripe.checkout.sessions.create(...) → session.url
    return {
      provider: this.name,
      redirectUrl: `${p.callbackUrl}?provider=stripe&paymentId=${p.paymentId}`,
    };
  }

  async parseWebhook(payload: any): Promise<WebhookResult> {
    // TODO(production): stripe.webhooks.constructEvent(...) imza doğrulama
    const obj = payload?.data?.object;
    return {
      paymentId: obj?.metadata?.paymentId,
      success: payload?.type === 'checkout.session.completed',
      providerRef: obj?.id,
    };
  }
}
