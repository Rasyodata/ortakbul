import { Module, Injectable, Controller, Get, Put, Param, Body } from '@nestjs/common';
import { IsString } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { Public } from '../common/decorators/public.decorator';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { PERMISSIONS } from '../common/enums/permission.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';

export class UpsertTranslationDto {
  @IsString() locale: string;
  @IsString() namespace: string;
  @IsString() key: string;
  @IsString() value: string;
}

// DB tabanlı çeviri: admin panelinden anahtar-değer düzenlenebilir.
@Injectable()
export class I18nService {
  constructor(private prisma: PrismaService, private audit: AuditService) {}

  async getLocale(locale: string) {
    const rows = await this.prisma.translation.findMany({ where: { locale } });
    const out: Record<string, Record<string, string>> = {};
    for (const r of rows) {
      out[r.namespace] = out[r.namespace] || {};
      out[r.namespace][r.key] = r.value;
    }
    return out;
  }

  listAll() {
    return this.prisma.translation.findMany({ orderBy: [{ locale: 'asc' }, { key: 'asc' }] });
  }

  async upsert(adminId: string, dto: UpsertTranslationDto) {
    const row = await this.prisma.translation.upsert({
      where: { locale_namespace_key: { locale: dto.locale, namespace: dto.namespace, key: dto.key } },
      update: { value: dto.value },
      create: dto,
    });
    await this.audit.log(adminId, 'i18n.upsert', 'Translation', row.id, { locale: dto.locale, key: dto.key });
    return row;
  }
}

@Controller()
class I18nController {
  constructor(private i18n: I18nService) {}

  @Public()
  @Get('i18n/:locale')
  locale(@Param('locale') locale: string) {
    return this.i18n.getLocale(locale);
  }

  @Get('admin/i18n')
  @RequirePermissions(PERMISSIONS.I18N_MANAGE)
  all() {
    return this.i18n.listAll();
  }

  @Put('admin/i18n')
  @RequirePermissions(PERMISSIONS.I18N_MANAGE)
  upsert(@CurrentUser('id') adminId: string, @Body() dto: UpsertTranslationDto) {
    return this.i18n.upsert(adminId, dto);
  }
}

@Module({ controllers: [I18nController], providers: [I18nService], exports: [I18nService] })
export class I18nModule {}
