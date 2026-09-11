import { CheckoutParams, CheckoutResult, PaymentProvider, WebhookResult } from './payment-provider.interface';

// PayTR adaptörü (TR). Production'da PayTR iframe/token API.
export class PaytrProvider implements PaymentProvider {
  readonly name = 'paytr';

  async createCheckout(p: CheckoutParams): Promise<CheckoutResult> {
    // TODO(production): PayTR get-token → iframe token
    return { provider: this.name, token: `paytr_${p.paymentId}` };
  }

  async parseWebhook(payload: any): Promise<WebhookResult> {
    // TODO(production): hash doğrulama
    return { paymentId: payload?.merchant_oid, success: payload?.status === 'success' };
  }
}
