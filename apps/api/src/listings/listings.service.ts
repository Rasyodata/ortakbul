import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ListingTier, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { AdminCreateListingDto, AssignConsultantDto, CreateListingDto } from './dto/create-listing.dto';
import { QueryListingDto } from './dto/query-listing.dto';
import { computeWomanBenefits } from '../common/benefits';

const TIER_WEIGHT: Record<ListingTier, number> = {
  NORMAL: 1,
  FEATURED: 2,
  PRIVILEGED: 3,
  SHOWCASE: 4,
};

@Injectable()
export class ListingsService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  // ---- Satış sürecindeki şirketin kimlik koruması ----
  // Firma adı + sahibinin adı kısmî maskelenir (ilk 2 harf + #) ki satış tamamlanana
  // kadar şirketin itibarı/hisse değeri zarar görmesin. Gerçek görüşme platform
  // üzerinden (teklif/NDA) yürür. Admin uçları gerçek adı görür.
  private maskWord(w: string): string {
    if (w.length <= 1) return w;
    if (w.length <= 3) return w.slice(0, 1) + '*'.repeat(w.length - 1);
    return w.slice(0, 2) + '*'.repeat(Math.min(w.length - 2, 6));
  }
  private maskIdentity(name?: string | null): string {
    if (!name) return name ?? '';
    return name.trim().split(/\s+/).map((w) => this.maskWord(w)).join(' ');
  }
  private protectCompany<T extends { type?: string; title?: string | null; owner?: any }>(l: T): T {
    if (!l || l.type !== 'COMPANY_SALE') return l;
    const masked: any = { ...l, title: this.maskIdentity(l.title), identityProtected: true };
    if (masked.owner?.fullName) masked.owner = { ...masked.owner, fullName: this.maskIdentity(masked.owner.fullName) };
    return masked;
  }

  async publicList(q: QueryListingDto) {
    const where: Prisma.ListingWhereInput = { status: 'APPROVED' };
    if (q.type) where.type = q.type;
    if (q.category) where.category = q.category;
    if (q.sector) where.sector = q.sector;
    if (q.countryCode) where.countryCode = q.countryCode;
    if (q.stage) where.stage = q.stage;
    if (q.partnershipType) where.partnershipType = q.partnershipType;
    if (q.capitalTier) where.capitalTier = q.capitalTier;
    if (q.audited === '1') where.audited = true;
    if (q.audited === '0') where.audited = false;
    if (q.ownerGender) where.owner = { is: { gender: q.ownerGender as any } };
    if (q.salePaymentType) where.salePaymentType = q.salePaymentType as any;
    if (q.maxAmountTL) {
      const max = Number(q.maxAmountTL);
      if (Number.isFinite(max)) where.amountTL = { gt: 0, lte: max };
    }
    if (q.search) {
      where.OR = [
        { title: { contains: q.search, mode: 'insensitive' } },
        { short: { contains: q.search, mode: 'insensitive' } },
      ];
    }

    const items = await this.prisma.listing.findMany({
      where,
      include: { owner: { select: { fullName: true, city: true } } },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
    return items
      .sort((a, b) => TIER_WEIGHT[b.tier] - TIER_WEIGHT[a.tier])
      .map((i) => this.protectCompany(i));
  }

  async getOne(id: string) {
    const listing = await this.prisma.listing.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, fullName: true, city: true, countryCode: true } },
        assignments: { include: { consultant: { select: { id: true, fullName: true } } } },
        reviewRequests: {
          include: { assignedConsultant: { select: { fullName: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!listing) throw new NotFoundException('İlan bulunamadı.');
    return this.protectCompany(listing);
  }

  async createByOwner(userId: string, dto: CreateListingDto) {
    // İlan verirken seçilen paket. Standart (NORMAL) ücretsiz; diğerleri ücretli
    // (kadın girişimciye indirimli). Ödeme entegrasyonunda tahsil edilir.
    const tier = (dto.tier as any) || 'NORMAL';
    const listing = await this.prisma.listing.create({
      data: {
        ...this.mapDto(dto),
        ownerId: userId,
        status: 'PENDING',
        tier,
        tierPaid: tier === 'NORMAL',
      },
    });
    await this.audit.log(userId, 'listing.create', 'Listing', listing.id, { type: listing.type, tier });
    return listing;
  }

  // Yönetici, üye adına ilan oluşturur; ücretli paketi ücretsiz atayabilir; doğrudan onaylı.
  async createByAdmin(adminId: string, dto: AdminCreateListingDto) {
    const tier = dto.tier ?? 'NORMAL';
    const listing = await this.prisma.listing.create({
      data: {
        ...this.mapDto(dto),
        ownerId: dto.ownerId,
        status: 'APPROVED',
        tier,
        tierPaid: tier !== 'NORMAL',
        createdByAdminId: adminId,
        approvedById: adminId,
        approvedAt: new Date(),
      },
    });
    if (tier !== 'NORMAL') {
      await this.prisma.payment.create({
        data: {
          userId: dto.ownerId,
          listingId: listing.id,
          provider: 'ADMIN_GRANT',
          tier,
          amount: 0,
          status: 'SUCCEEDED',
        },
      });
    }
    await this.audit.log(adminId, 'listing.admin_create', 'Listing', listing.id, {
      onBehalfOf: dto.ownerId,
      tier,
    });
    return listing;
  }

  async approve(adminId: string, id: string) {
    await this.ensureExists(id);
    const listing = await this.prisma.listing.update({
      where: { id },
      data: { status: 'APPROVED', approvedById: adminId, approvedAt: new Date() },
    });
    await this.audit.log(adminId, 'listing.approve', 'Listing', id);
    return listing;
  }

  async setStatus(adminId: string, id: string, status: 'PENDING' | 'REJECTED' | 'ARCHIVED') {
    await this.ensureExists(id);
    const listing = await this.prisma.listing.update({ where: { id }, data: { status } });
    await this.audit.log(adminId, `listing.${status.toLowerCase()}`, 'Listing', id);
    return listing;
  }

  async assignConsultant(adminId: string, listingId: string, dto: AssignConsultantDto) {
    await this.ensureExists(listingId);
    const consultant = await this.prisma.user.findUnique({
      where: { id: dto.consultantUserId },
      include: { consultantProfile: true },
    });
    if (!consultant || !consultant.consultantProfile)
      throw new ForbiddenException('Seçilen kullanıcı danışman değil.');

    const role = dto.role ?? 'CONSULTANT';
    const assignment = await this.prisma.consultantAssignment.upsert({
      where: {
        listingId_consultantId_role: {
          listingId,
          consultantId: dto.consultantUserId,
          role,
        },
      },
      update: { assignedById: adminId },
      create: { listingId, consultantId: dto.consultantUserId, role, assignedById: adminId },
    });
    await this.audit.log(adminId, 'assignment.manage', 'Listing', listingId, {
      consultantUserId: dto.consultantUserId,
      role,
    });
    return assignment;
  }

  myListings(userId: string) {
    return this.prisma.listing.findMany({ where: { ownerId: userId }, orderBy: { createdAt: 'desc' } });
  }

  // Danışman yalnızca kendisine atanan ilanları görür.
  assignedToMe(consultantUserId: string) {
    return this.prisma.listing.findMany({
      where: { assignments: { some: { consultantId: consultantUserId } } },
      include: { owner: { select: { fullName: true } }, assignments: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  adminList(q: QueryListingDto) {
    const where: Prisma.ListingWhereInput = {};
    if (q.type) where.type = q.type;
    return this.prisma.listing.findMany({
      where,
      include: { owner: { select: { fullName: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  // "1.500.000 ₺ sermaye" gibi serbest metinden sayısal ₺ değeri çıkarır.
  private parseAmountTL(text?: string): number | undefined {
    if (!text) return undefined;
    const digits = text.replace(/[^\d]/g, '');
    if (!digits) return undefined;
    const n = Number(digits);
    return Number.isFinite(n) && n > 0 ? n : undefined;
  }

  // İhbar / şikayet
  async report(reporterId: string, listingId: string, reason: string, note?: string) {
    await this.ensureExists(listingId);
    const rep = await this.prisma.report.create({
      data: { listingId, reporterId, reason: reason as any, note },
    });
    await this.audit.log(reporterId, 'listing.report', 'Listing', listingId, { reason });
    return { ok: true, id: rep.id };
  }

  adminReports() {
    return this.prisma.report.findMany({
      include: {
        listing: { select: { id: true, title: true, type: true, ownerId: true } },
        reporter: { select: { fullName: true, email: true } },
      },
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
      take: 500,
    });
  }

  async resolveReport(adminId: string, id: string, status: string) {
    const rep = await this.prisma.report.update({ where: { id }, data: { status: status as any } });
    await this.audit.log(adminId, 'report.resolve', 'Report', id, { status });
    return rep;
  }

  // Ücretli danışman incelemesi — satış tutarının yüzdesi
  // Toplam inceleme = %1 (Avukat+Mali %0.8 → her biri %0.4, Sektör Temsilcisi %0.2). Sektör Raporu bağımsız %1.
  private reviewRate(type: string): number {
    const m: Record<string, number> = { LAWYER: 0.004, ACCOUNTANT: 0.004, SECTOR_REP: 0.002, SECTOR_REPORT: 0.01 };
    return m[type] ?? 0.004;
  }
  private reviewFeeText(type: string, amountTL?: number | null): string {
    const pct = (this.reviewRate(type) * 100).toString().replace('.', ',');
    if (amountTL && amountTL > 0) {
      const fee = Math.round(amountTL * this.reviewRate(type));
      return `${fee.toLocaleString('tr-TR')} ₺ (satış tutarının %${pct}'i)`;
    }
    return `Satış tutarının %${pct}'i`;
  }

  async createReviewRequest(requesterId: string, listingId: string, type: string, note?: string) {
    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
      select: { id: true, amountTL: true },
    });
    if (!listing) throw new NotFoundException('İlan bulunamadı.');

    // Kadın girişimci ayrıcalıkları — mali müşavirlik ilk 4 ay ücretsiz, denetim/inceleme %50 indirim (1 yıl)
    const requester = await this.prisma.user.findUnique({
      where: { id: requesterId },
      select: { gender: true, createdAt: true },
    });
    const ben = computeWomanBenefits(requester);
    let feeText = this.reviewFeeText(type, listing.amountTL);
    let benefitApplied: string | undefined;

    if (type === 'ACCOUNTANT' && ben.accountingFree) {
      feeText = `ÜCRETSİZ — Kadın girişimci ayrıcalığı (ilk 4 ay mali müşavirlik platformdan). Kalan ${ben.accountingDaysLeft} gün.`;
      benefitApplied = 'KADIN_MALI_MUSAVIRLIK_UCRETSIZ';
    } else if (ben.auditDiscountPct > 0 && type !== 'ACCOUNTANT') {
      const base = listing.amountTL ? Math.round(listing.amountTL * this.reviewRate(type)) : 0;
      if (base > 0) {
        const disc = Math.round(base * (1 - ben.auditDiscountPct / 100));
        feeText = `${disc.toLocaleString('tr-TR')} ₺ — Kadın girişimci %${ben.auditDiscountPct} indirim (normal ${base.toLocaleString('tr-TR')} ₺)`;
      } else {
        feeText = `%${ben.auditDiscountPct} indirimli — Kadın girişimci ayrıcalığı (denetim/inceleme)`;
      }
      benefitApplied = 'KADIN_DENETIM_INDIRIM_50';
    }

    const finalNote = benefitApplied ? `${note ? note + ' · ' : ''}[${benefitApplied}]` : note;
    const rr = await this.prisma.reviewRequest.create({
      data: { listingId, requesterId, type: type as any, feeText, note: finalNote },
    });
    await this.audit.log(requesterId, 'review.request', 'Listing', listingId, { type, benefitApplied });
    return rr;
  }

  openReviewRequests() {
    return this.prisma.reviewRequest.findMany({
      where: { status: 'OPEN' },
      include: {
        listing: { select: { id: true, title: true, type: true, sector: true } },
        requester: { select: { fullName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async offerReview(consultantId: string, id: string) {
    const c = await this.prisma.consultantProfile.findUnique({ where: { userId: consultantId } });
    if (!c || c.status !== 'APPROVED') throw new ForbiddenException('Yalnızca onaylı danışmanlar talepte bulunabilir.');
    const rr = await this.prisma.reviewRequest.update({
      where: { id },
      data: { assignedConsultantId: consultantId, status: 'OFFERED' },
    });
    await this.audit.log(consultantId, 'review.offer', 'ReviewRequest', id);
    return rr;
  }

  reviewRequestsForConsultant(consultantId: string) {
    return this.prisma.reviewRequest.findMany({
      where: { assignedConsultantId: consultantId },
      include: { listing: { select: { id: true, title: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  private async ensureExists(id: string) {
    const found = await this.prisma.listing.findUnique({ where: { id }, select: { id: true } });
    if (!found) throw new NotFoundException('İlan bulunamadı.');
  }

  private mapDto(dto: CreateListingDto): Prisma.ListingCreateInput | any {
    return {
      type: dto.type,
      title: dto.title,
      short: dto.short,
      detail: dto.detail,
      category: dto.category,
      sector: dto.sector,
      countryCode: dto.countryCode,
      city: dto.city,
      amountText: dto.amountText,
      amountTL: dto.amountTL ?? this.parseAmountTL(dto.amountText),
      stage: dto.stage,
      problem: dto.problem,
      audience: dto.audience,
      structure: dto.structure,
      partnershipType: dto.partnershipType,
      audited: dto.audited ?? false,
      price: dto.price,
      foundedYear: dto.foundedYear,
      employees: dto.employees,
      revenue: dto.revenue,
      reason: dto.reason,
      salePaymentType: dto.salePaymentType,
      franchiseKind: dto.franchiseKind,
      investTL: dto.investTL,
      capitalTier: dto.capitalTier,
      sectors: dto.sectors ?? [],
      details: dto.details ?? undefined,
    };
  }
}
