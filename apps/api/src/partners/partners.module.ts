import { Module } from '@nestjs/common';
import { IsArray, IsInt, IsOptional, IsString } from 'class-validator';
import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { Public } from '../common/decorators/public.decorator';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { PERMISSIONS } from '../common/enums/permission.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';

export class CreatePartnerDto {
  @IsString() name: string;
  @IsString() type: string;
  @IsString() region: string;
  @IsArray() @IsString({ each: true }) sectors: string[];
  @IsOptional() @IsInt() since?: number;
  @IsOptional() @IsString() note?: string;
}

@Controller('partners')
class PartnersController {
  constructor(private prisma: PrismaService) {}
  @Public()
  @Get()
  list() {
    return this.prisma.partnerFirm.findMany({ where: { status: 'APPROVED' }, orderBy: { createdAt: 'desc' } });
  }
}

@Controller('admin/partners')
class AdminPartnersController {
  constructor(private prisma: PrismaService, private audit: AuditService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.LISTING_READ)
  all() {
    return this.prisma.partnerFirm.findMany({ orderBy: { createdAt: 'desc' } });
  }

  @Post()
  @RequirePermissions(PERMISSIONS.LISTING_WRITE)
  async create(@CurrentUser('id') adminId: string, @Body() dto: CreatePartnerDto) {
    const p = await this.prisma.partnerFirm.create({ data: { ...dto, status: 'APPROVED' } });
    await this.audit.log(adminId, 'partner.create', 'PartnerFirm', p.id);
    return p;
  }
}

@Module({
  controllers: [PartnersController, AdminPartnersController],
})
export class PartnersModule {}
