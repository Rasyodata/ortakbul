import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ListingTier, PaymentProvider as PProvider } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CheckoutDto } from './dto/checkout.dto';
import { PaymentProvider } from './providers/payment-provider.interface';
import { IyzicoProvider } from './providers/iyzico.provider';
import { PaytrProvider } from './providers/paytr.provider';
import { StripeProvider } from './providers/stripe.provider';

// Paket fiyatları (kuruş cinsinden aylık)
const TIER_PRICE_KURUS: Record<ListingTier, number> = {
  NORMAL: 0,
  FEATURED: 249_00,
  PRIVILEGED: 599_00,
  SHOWCASE: 1499_00,
};

@Injectable()
export class PaymentsService {
  private providers: Record<string, PaymentProvider>;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private audit: AuditService,
  ) {
    this.providers = {
      iyzico: new IyzicoProvider({
        apiKey: this.config.get<string>('payment.iyzico.apiKey'),
        secretKey: this.config.get<string>('payment.iyzico.secretKey'),
        uri: this.config.get<string>('payment.iyzico.uri'),
      }),
      paytr: new PaytrProvider(),
      stripe: new StripeProvider(),
    };
  }

  private pick(name?: string): PaymentProvider {
    const key = (name || this.config.get<string>('payment.defaultProvider') || 'iyzico').toLowerCase();
    const p = this.providers[key];
    if (!p) throw new BadRequestException('Geçersiz ödeme sağlayıcısı.');
    return p;
  }

  async checkout(userId: string, dto: CheckoutDto) {
    if (dto.tier === 'NORMAL') throw new BadRequestException('NORMAL paket ücretsizdir.');
    const listing = await this.prisma.listing.findUnique({ where: { id: dto.listingId } });
    if (!listing) throw new NotFoundException('İlan bulunamadı.');
    if (listing.ownerId !== userId) throw new BadRequestException('Bu ilan sana ait değil.');

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Kullanıcı bulunamadı.');

    const amount = TIER_PRICE_KURUS[dto.tier];
    const providerEnum = (dto.provider ?? this.enumFromName()) as PProvider;

    const payment = await this.prisma.payment.create({
      data: {
        userId,
        listingId: dto.listingId,
        provider: providerEnum,
        tier: dto.tier,
        amount,
        currency: 'TRY',
        status: 'PENDING',
      },
    });

    const [name, ...rest] = (user.fullName || 'Müşteri').split(' ');
    const provider = this.pick(providerEnum.toLowerCase());
    // iyzico callback'i backend webhook'una gelir (token ile), sonra retrieve edilir.
    const checkout = await provider.createCheckout({
      paymentId: payment.id,
      amount,
      currency: 'TRY',
      description: `ortakbul.org ${dto.tier} paket`,
      callbackUrl: `${this.apiBase()}/payments/webhook/${provider.name}`,
      itemName: `${dto.tier} paket — ${listing.title}`.slice(0, 60),
      buyer: {
        id: user.id,
        name,
        surname: rest.join(' ') || name,
        email: user.email,
        phone: user.phone || undefined,
        city: user.city || undefined,
        country: user.countryCode || 'TR',
      },
    });

    await this.audit.log(userId, 'payment.checkout', 'Payment', payment.id, { tier: dto.tier, provider: provider.name });
    return { payment: { id: payment.id, status: payment.status, amount }, checkout };
  }

  async handleWebhook(providerName: string, payload: any, headers: Record<string, any>) {
    const provider = this.pick(providerName);
    const result = await provider.parseWebhook(payload, headers);
    if (!result.paymentId) throw new BadRequestException('paymentId yok.');

    const payment = await this.prisma.payment.findUnique({ where: { id: result.paymentId } });
    if (!payment) throw new NotFoundException('Ödeme bulunamadı.');

    if (result.success) {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'SUCCEEDED', providerRef: result.providerRef },
      });
      // Ödeme başarılı → ilan paketini yükselt
      if (payment.listingId && payment.tier) {
        await this.prisma.listing.update({
          where: { id: payment.listingId },
          data: { tier: payment.tier, tierPaid: true },
        });
      }
      await this.audit.log(null, 'payment.succeeded', 'Payment', payment.id);
    } else {
      await this.prisma.payment.update({ where: { id: payment.id }, data: { status: 'FAILED' } });
      await this.audit.log(null, 'payment.failed', 'Payment', payment.id);
    }
    return { ok: true };
  }

  adminList() {
    return this.prisma.payment.findMany({
      include: { user: { select: { fullName: true, email: true } }, listing: { select: { title: true } } },
      orderBy: { createdAt: 'desc' },
      take: 500,
    });
  }

  private apiBase(): string {
    const port = this.config.get<number>('port') || 4000;
    return `http://localhost:${port}/api`;
  }

  private enumFromName(): PProvider {
    const name = (this.config.get<string>('payment.defaultProvider') || 'iyzico').toUpperCase();
    return (['IYZICO', 'PAYTR', 'STRIPE'].includes(name) ? name : 'IYZICO') as PProvider;
  }
}
