import { Module, Injectable, Controller, Get, Post, Body, Param } from '@nestjs/common';
import { IsArray, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { PERMISSIONS } from '../common/enums/permission.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';

// "Size Uygun İşi Biz Bulalım" — girişimci eşleştirme / mentörlük talebi.
class CreateMatchDto {
  @IsString() @MinLength(3) @MaxLength(120) fullName!: string;
  @IsOptional() @IsString() @MaxLength(160) email?: string;
  @IsOptional() @IsString() @MaxLength(40) phone?: string;
  @IsOptional() @IsString() countryCode?: string;
  @IsOptional() @IsString() city?: string;
  @IsString() budgetTier!: string;
  @IsOptional() @IsArray() sectors?: string[];
  @IsOptional() @IsArray() opportunityTypes?: string[];
  @IsOptional() @IsArray() businessTypes?: string[];
  @IsOptional() @IsString() workStyle?: string;
  @IsOptional() @IsString() risk?: string;
  @IsOptional() @IsString() @MaxLength(2000) experience?: string;
  @IsOptional() @IsString() @MaxLength(2000) goal?: string;
  @IsOptional() @IsString() @MaxLength(2000) note?: string;
}
class MatchStatusDto { @IsString() status!: string; }

@Injectable()
export class MatchService {
  constructor(private prisma: PrismaService, private audit: AuditService) {}

  async create(dto: CreateMatchDto, userId?: string) {
    const m = await this.prisma.matchRequest.create({
      data: {
        userId: userId ?? null,
        fullName: dto.fullName,
        email: dto.email,
        phone: dto.phone,
        countryCode: dto.countryCode,
        city: dto.city,
        budgetTier: dto.budgetTier,
        sectors: dto.sectors ?? [],
        opportunityTypes: dto.opportunityTypes ?? [],
        businessTypes: dto.businessTypes ?? [],
        workStyle: dto.workStyle,
        risk: dto.risk,
        experience: dto.experience,
        goal: dto.goal,
        note: dto.note,
      },
    });
    await this.audit.log(userId ?? null, 'match.request', 'MatchRequest', m.id, { budgetTier: dto.budgetTier });
    return { ok: true, id: m.id };
  }

  list() {
    return this.prisma.matchRequest.findMany({
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
      take: 500,
    });
  }

  async setStatus(adminId: string, id: string, status: string) {
    const m = await this.prisma.matchRequest.update({ where: { id }, data: { status: status as any } });
    await this.audit.log(adminId, 'match.status', 'MatchRequest', id, { status });
    return m;
  }
}

@Controller()
class MatchController {
  constructor(private match: MatchService) {}

  // Ziyaretçi veya üye doldurabilir (public).
  @Public()
  @Post('match-requests')
  create(@Body() dto: CreateMatchDto) {
    return this.match.create(dto);
  }

  @Get('admin/match-requests')
  @RequirePermissions(PERMISSIONS.USER_READ)
  list() {
    return this.match.list();
  }

  @Post('admin/match-requests/:id/status')
  @RequirePermissions(PERMISSIONS.USER_WRITE)
  setStatus(@CurrentUser('id') adminId: string, @Param('id') id: string, @Body() dto: MatchStatusDto) {
    return this.match.setStatus(adminId, id, dto.status);
  }
}

@Module({ controllers: [MatchController], providers: [MatchService] })
export class MatchModule {}
