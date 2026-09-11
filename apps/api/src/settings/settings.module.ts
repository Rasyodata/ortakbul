import { Module, Injectable, Controller, Get, Put, Body } from '@nestjs/common';
import { IsObject, IsOptional, IsString } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { PERMISSIONS } from '../common/enums/permission.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';

const SINGLETON = 'singleton';

export class UpdateSiteSettingsDto {
  @IsOptional() @IsObject() socialLinks?: Record<string, string>;
  @IsOptional() @IsString() headScripts?: string;
  @IsOptional() @IsString() bodyScripts?: string;
  @IsOptional() @IsObject() announcement?: Record<string, any>;
}

const DEFAULT_ANNOUNCEMENT = {
  enabled: false,
  title: '📱 Mobil uygulamalarımız çok yakında!',
  message: 'iOS ve Android uygulamalarımız çok yakında hizmetinizde. Ortağını artık cebinden bul!',
  imageUrl: '',
  position: 'center', // center | bottom-right | bottom-left | top-center
  ctaText: '',
  ctaLink: '',
  version: '1',
};

// Site geneli ayarlar — sosyal medya linkleri + head/body script enjeksiyonu.
@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService, private audit: AuditService) {}

  async get() {
    const s = await this.prisma.siteSetting.upsert({
      where: { id: SINGLETON },
      create: { id: SINGLETON, socialLinks: {} },
      update: {},
    });
    return {
      socialLinks: (s.socialLinks as Record<string, string>) || {},
      headScripts: s.headScripts || '',
      bodyScripts: s.bodyScripts || '',
      announcement: { ...DEFAULT_ANNOUNCEMENT, ...((s.announcement as Record<string, any>) || {}) },
    };
  }

  async update(adminId: string, dto: UpdateSiteSettingsDto) {
    const data: any = {};
    if (dto.socialLinks !== undefined) data.socialLinks = dto.socialLinks;
    if (dto.headScripts !== undefined) data.headScripts = dto.headScripts;
    if (dto.bodyScripts !== undefined) data.bodyScripts = dto.bodyScripts;
    if (dto.announcement !== undefined) data.announcement = dto.announcement;
    await this.prisma.siteSetting.upsert({
      where: { id: SINGLETON },
      create: { id: SINGLETON, ...data },
      update: data,
    });
    await this.audit.log(adminId, 'settings.update', 'SiteSetting', SINGLETON, Object.keys(data));
    return this.get();
  }
}

@Controller()
class SettingsController {
  constructor(private settings: SettingsService) {}

  @Public()
  @Get('site-settings')
  get() {
    return this.settings.get();
  }

  @Put('admin/site-settings')
  @RequirePermissions(PERMISSIONS.ROLE_MANAGE)
  update(@CurrentUser('id') adminId: string, @Body() dto: UpdateSiteSettingsDto) {
    return this.settings.update(adminId, dto);
  }
}

@Module({ controllers: [SettingsController], providers: [SettingsService] })
export class SettingsModule {}
