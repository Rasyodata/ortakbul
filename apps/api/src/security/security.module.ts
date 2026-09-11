import { Module, Injectable, Controller, Get, Post, Body, Param, CanActivate, ExecutionContext, ForbiddenException, OnModuleInit } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IsOptional, IsString } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { PERMISSIONS } from '../common/enums/permission.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';

// İstemci IP'sini güvenilir biçimde çıkar (trust proxy açık olmalı).
export function clientIp(req: any): string {
  const xf = (req.headers?.['x-forwarded-for'] as string) || '';
  const ip = xf.split(',')[0].trim() || req.ip || req.socket?.remoteAddress || '';
  return ip.replace(/^::ffff:/, '');
}

@Injectable()
export class SecurityService implements OnModuleInit {
  private bannedIps = new Set<string>();
  constructor(private prisma: PrismaService, private audit: AuditService) {}

  async onModuleInit() { await this.refresh(); }

  async refresh() {
    const rows = await this.prisma.bannedIp.findMany({ select: { ip: true } });
    this.bannedIps = new Set(rows.map((r) => r.ip));
  }
  isBanned(ip: string) { return this.bannedIps.has(ip); }

  async logEvent(type: string, data: { ip?: string; userAgent?: string; email?: string; userId?: string; meta?: any }) {
    try { await this.prisma.securityEvent.create({ data: { type, ...data } }); } catch { /* sessiz */ }
  }

  async banIp(adminId: string, ip: string, reason?: string) {
    await this.prisma.bannedIp.upsert({ where: { ip }, create: { ip, reason }, update: { reason } });
    await this.refresh();
    await this.audit.log(adminId, 'security.banIp', 'BannedIp', ip, { reason });
    await this.logEvent('ip.ban', { ip, meta: { by: adminId, reason } });
    return { ip, banned: true };
  }
  async unbanIp(adminId: string, ip: string) {
    await this.prisma.bannedIp.deleteMany({ where: { ip } });
    await this.refresh();
    await this.audit.log(adminId, 'security.unbanIp', 'BannedIp', ip);
    return { ip, banned: false };
  }
  listBannedIps() { return this.prisma.bannedIp.findMany({ orderBy: { createdAt: 'desc' } }); }
  recentEvents() { return this.prisma.securityEvent.findMany({ orderBy: { createdAt: 'desc' }, take: 100 }); }

  // Kullanıcıyı askıya al (+ isteğe bağlı son IP'sini de banla)
  async suspendUser(adminId: string, userId: string, reason?: string, alsoBanIp?: boolean) {
    const u = await this.prisma.user.update({ where: { id: userId }, data: { status: 'SUSPENDED', banReason: reason } });
    if (alsoBanIp && u.lastIp) await this.banIp(adminId, u.lastIp, `user:${userId} ${reason || ''}`.trim());
    await this.audit.log(adminId, 'security.suspendUser', 'User', userId, { reason, alsoBanIp });
    await this.logEvent('user.suspend', { userId, meta: { by: adminId, reason } });
    return { userId, status: 'SUSPENDED' };
  }
  async reactivateUser(adminId: string, userId: string) {
    await this.prisma.user.update({ where: { id: userId }, data: { status: 'APPROVED', banReason: null } });
    await this.audit.log(adminId, 'security.reactivateUser', 'User', userId);
    return { userId, status: 'APPROVED' };
  }
}

// Global guard: engellenen IP'leri reddeder (JWT'den önce çalışır, herkese uygulanır).
@Injectable()
export class IpBanGuard implements CanActivate {
  constructor(private security: SecurityService) {}
  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest();
    const ip = clientIp(req);
    req.clientIp = ip;
    if (ip && this.security.isBanned(ip)) {
      this.security.logEvent('ip.blocked', { ip, userAgent: req.headers?.['user-agent'] });
      throw new ForbiddenException('Erişiminiz engellendi.');
    }
    return true;
  }
}

class BanIpDto { @IsString() ip!: string; @IsOptional() @IsString() reason?: string; }
class SuspendDto { @IsOptional() @IsString() reason?: string; @IsOptional() alsoBanIp?: boolean; }

@Controller('admin/security')
class SecurityController {
  constructor(private security: SecurityService) {}

  @Get('events') @RequirePermissions(PERMISSIONS.AUDIT_READ)
  events() { return this.security.recentEvents(); }

  @Get('banned-ips') @RequirePermissions(PERMISSIONS.USER_WRITE)
  banned() { return this.security.listBannedIps(); }

  @Post('ban-ip') @RequirePermissions(PERMISSIONS.USER_WRITE)
  ban(@CurrentUser('id') adminId: string, @Body() dto: BanIpDto) { return this.security.banIp(adminId, dto.ip, dto.reason); }

  @Post('unban-ip') @RequirePermissions(PERMISSIONS.USER_WRITE)
  unban(@CurrentUser('id') adminId: string, @Body() dto: BanIpDto) { return this.security.unbanIp(adminId, dto.ip); }

  @Post('users/:id/suspend') @RequirePermissions(PERMISSIONS.USER_WRITE)
  suspend(@CurrentUser('id') adminId: string, @Param('id') id: string, @Body() dto: SuspendDto) {
    return this.security.suspendUser(adminId, id, dto.reason, dto.alsoBanIp);
  }

  @Post('users/:id/reactivate') @RequirePermissions(PERMISSIONS.USER_WRITE)
  reactivate(@CurrentUser('id') adminId: string, @Param('id') id: string) {
    return this.security.reactivateUser(adminId, id);
  }
}

@Module({ controllers: [SecurityController], providers: [SecurityService], exports: [SecurityService] })
export class SecurityModule {}
