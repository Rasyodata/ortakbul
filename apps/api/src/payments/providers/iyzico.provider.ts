import { CheckoutParams, CheckoutResult, PaymentProvider, WebhookResult } from './payment-provider.interface';

// iyzico Checkout Form entegrasyonu (TR).
// Anahtarlar (.env: IYZICO_API_KEY / IYZICO_SECRET / IYZICO_BASE_URL) tanımlıysa GERÇEK çağrı yapılır;
// tanımlı değilse güvenli dev-mock ile akış bozulmaz (resmi API beklenirken geliştirmeye devam edilebilir).
export interface IyzicoConfig {
  apiKey?: string;
  secretKey?: string;
  uri?: string;
}

export class IyzicoProvider implements PaymentProvider {
  readonly name = 'iyzico';
  private client: any = null;
  private Iyzipay: any = null;

  constructor(private config: IyzicoConfig) {
    if (config.apiKey && config.secretKey) {
      // Lazy require: paket yoksa/mock modda uygulama patlamaz.
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      this.Iyzipay = require('iyzipay');
      this.client = new this.Iyzipay({
        apiKey: config.apiKey,
        secretKey: config.secretKey,
        uri: config.uri || 'https://sandbox-api.iyzipay.com',
      });
    }
  }

  get configured() {
    return !!this.client;
  }

  private tl(amountKurus: number) {
    return (amountKurus / 100).toFixed(2);
  }

  async createCheckout(p: CheckoutParams): Promise<CheckoutResult> {
    if (!this.configured) {
      // DEV-MOCK: iyzico anahtarı gelene kadar
      return {
        provider: this.name,
        token: `iyzico_mock_${p.paymentId}`,
        redirectUrl: `${p.callbackUrl}?provider=iyzico&paymentId=${p.paymentId}&mock=1`,
        raw: { mock: true, note: 'iyzico API anahtarı bekleniyor (.env IYZICO_API_KEY)' },
      };
    }

    const Iyzipay = this.Iyzipay;
    const price = this.tl(p.amount);
    const [name, ...rest] = (p.buyer.name || 'Musteri').split(' ');
    const surname = p.buyer.surname || rest.join(' ') || 'Musteri';
    const request = {
      locale: Iyzipay.LOCALE.TR,
      conversationId: p.paymentId,
      price,
      paidPrice: price,
      currency: Iyzipay.CURRENCY.TRY,
      basketId: p.paymentId,
      paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
      callbackUrl: p.callbackUrl,
      enabledInstallments: [1],
      buyer: {
        id: p.buyer.id,
        name,
        surname,
        gsmNumber: p.buyer.phone || '+905000000000',
        email: p.buyer.email,
        identityNumber: p.buyer.identityNumber || '11111111111',
        registrationAddress: p.buyer.address || 'Adres belirtilmedi',
        ip: '85.34.78.112',
        city: p.buyer.city || 'Istanbul',
        country: p.buyer.country || 'Turkey',
      },
      shippingAddress: {
        contactName: p.buyer.name,
        city: p.buyer.city || 'Istanbul',
        country: p.buyer.country || 'Turkey',
        address: p.buyer.address || 'Adres belirtilmedi',
      },
      billingAddress: {
        contactName: p.buyer.name,
        city: p.buyer.city || 'Istanbul',
        country: p.buyer.country || 'Turkey',
        address: p.buyer.address || 'Adres belirtilmedi',
      },
      basketItems: [
        {
          id: p.paymentId,
          name: p.itemName,
          category1: 'Ilan Paketi',
          itemType: Iyzipay.BASKET_ITEM_TYPE.VIRTUAL,
          price,
        },
      ],
    };

    const result: any = await new Promise((resolve, reject) => {
      this.client.checkoutFormInitialize.create(request, (err: any, res: any) =>
        err ? reject(err) : resolve(res),
      );
    });

    if (result.status !== 'success') {
      throw new Error(result.errorMessage || 'iyzico başlatma hatası');
    }
    return {
      provider: this.name,
      token: result.token,
      redirectUrl: result.paymentPageUrl,
      raw: { checkoutFormContent: result.checkoutFormContent },
    };
  }

  async parseWebhook(payload: any): Promise<WebhookResult> {
    const token = payload?.token;
    if (!this.configured) {
      return { paymentId: payload?.paymentId, success: payload?.mock === '1' || payload?.status === 'success' };
    }
    const Iyzipay = this.Iyzipay;
    const result: any = await new Promise((resolve, reject) => {
      this.client.checkoutForm.retrieve(
        { locale: Iyzipay.LOCALE.TR, token },
        (err: any, res: any) => (err ? reject(err) : resolve(res)),
      );
    });
    return {
      paymentId: result.basketId || result.conversationId,
      success: result.paymentStatus === 'SUCCESS',
      providerRef: result.paymentId,
    };
  }
}
