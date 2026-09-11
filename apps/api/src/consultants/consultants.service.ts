import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { AnswerQuestionDto, ApplyConsultantDto, AskQuestionDto, QueryConsultantDto } from './dto/consultant.dto';
import { computeWomanBenefits } from '../common/benefits';

@Injectable()
export class ConsultantsService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  async publicList(q: QueryConsultantDto) {
    const where: Prisma.ConsultantProfileWhereInput = { status: 'APPROVED' };
    if (q.category) where.category = q.category;
    if (q.sector) where.sector = q.sector;
    if (q.search) {
      where.OR = [
        { bio: { contains: q.search, mode: 'insensitive' } },
        { user: { is: { fullName: { contains: q.search, mode: 'insensitive' } } } },
      ];
    }
    return this.prisma.consultantProfile.findMany({
      where,
      include: {
        user: {
          select: {
            id: true, fullName: true, city: true, countryCode: true,
            _count: { select: { assignments: true } }, // atandığı ilan/üye sayısı (analiz)
          },
        },
      },
      orderBy: [{ verified: 'desc' }, { ratingAvg: 'desc' }],
    });
  }

  async getByUserId(userId: string) {
    const profile = await this.prisma.consultantProfile.findUnique({
      where: { userId },
      include: { user: { select: { id: true, fullName: true, city: true, countryCode: true } } },
    });
    if (!profile) throw new NotFoundException('Danışman bulunamadı.');
    const assignments = await this.prisma.consultantAssignment.findMany({
      where: { consultantId: userId },
      include: { listing: { select: { id: true, title: true, type: true } } },
    });
    return { ...profile, assignments };
  }

  async apply(userId: string, dto: ApplyConsultantDto) {
    const existing = await this.prisma.consultantProfile.findUnique({ where: { userId } });
    if (existing) throw new BadRequestException('Zaten bir danışman başvurun/profilin var.');
    const profile = await this.prisma.consultantProfile.create({
      data: {
        userId,
        category: dto.category,
        sector: dto.sector,
        experienceYears: dto.experienceYears,
        bio: dto.bio,
        feeText: dto.feeText,
        tags: dto.tags ?? [dto.category],
        status: 'PENDING',
      },
    });
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        memberType: 'CONSULTANT',
        ...(dto.countryCode ? { countryCode: dto.countryCode.toUpperCase() } : {}),
        ...(dto.city ? { city: dto.city } : {}),
      },
    });
    await this.audit.log(userId, 'consultant.apply', 'ConsultantProfile', profile.id);
    return profile;
  }

  listPending() {
    return this.prisma.consultantProfile.findMany({
      where: { status: 'PENDING' },
      include: { user: { select: { fullName: true, email: true, countryCode: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async approve(adminId: string, userId: string) {
    await this.ensure(userId);
    const p = await this.prisma.consultantProfile.update({
      where: { userId },
      data: { status: 'APPROVED', verified: true },
    });
    await this.audit.log(adminId, 'consultant.approve', 'ConsultantProfile', p.id);
    return p;
  }

  async reject(adminId: string, userId: string) {
    await this.ensure(userId);
    const p = await this.prisma.consultantProfile.update({ where: { userId }, data: { status: 'REJECTED' } });
    await this.audit.log(adminId, 'consultant.reject', 'ConsultantProfile', p.id);
    return p;
  }

  async ask(fromUserId: string, consultantUserId: string, dto: AskQuestionDto) {
    const profile = await this.prisma.consultantProfile.findUnique({ where: { userId: consultantUserId } });
    if (!profile || profile.status !== 'APPROVED') throw new NotFoundException('Danışman bulunamadı.');

    // Kadın girişimci ayrıcalığı — 1 yıl boyunca danışmanlık ücretsiz (talebe not düşülür)
    const from = await this.prisma.user.findUnique({
      where: { id: fromUserId },
      select: { gender: true, createdAt: true },
    });
    const ben = computeWomanBenefits(from);
    const question = ben.consultancyFree
      ? `${dto.question}\n\n[KADIN GİRİŞİMCİ AYRICALIĞI — Bu danışmanlık, yeni iş kuran kadın girişimci programı kapsamında 1 yıl ücretsizdir. Kalan ${ben.consultancyDaysLeft} gün.]`
      : dto.question;

    return this.prisma.question.create({
      data: {
        consultantId: consultantUserId,
        fromUserId,
        listingId: dto.listingId,
        question,
      },
    });
  }

  // Danışman yalnızca kendisine yöneltilen soruları görür.
  myQuestions(consultantUserId: string) {
    return this.prisma.question.findMany({
      where: { consultantId: consultantUserId },
      include: {
        fromUser: { select: { fullName: true } },
        listing: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async answer(consultantUserId: string, questionId: string, dto: AnswerQuestionDto) {
    const q = await this.prisma.question.findUnique({ where: { id: questionId } });
    if (!q) throw new NotFoundException('Soru bulunamadı.');
    if (q.consultantId !== consultantUserId)
      throw new ForbiddenException('Bu soru sana atanmadı.');
    return this.prisma.question.update({
      where: { id: questionId },
      data: { answer: dto.answer, answeredAt: new Date() },
    });
  }

  private async ensure(userId: string) {
    const p = await this.prisma.consultantProfile.findUnique({ where: { userId }, select: { id: true } });
    if (!p) throw new NotFoundException('Danışman profili bulunamadı.');
  }
}
