import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import { createHash, randomInt, randomUUID } from 'crypto';
import { AuthProvider, VerificationChannel } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { SmsService } from '../sms/sms.service';
import { AuditService } from '../audit/audit.service';
import { SocialService } from './social/social.service';
import { computeWomanBenefits } from '../common/benefits';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { SocialLoginDto } from './dto/social-login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private mail: MailService,
    private sms: SmsService,
    private audit: AuditService,
    private social: SocialService,
  ) {}

  async socialAuthUrl(provider: AuthProvider) {
    return { url: this.social.authorizeUrl(provider) };
  }

  // Sosyal giriş: profil doğrulanır, kullanıcı bulunur/oluşturulur (üyelik yine onaya düşer).
  async socialLogin(dto: SocialLoginDto) {
    const profile = await this.social.verify(dto.provider, dto.token, {
      email: dto.email,
      fullName: dto.fullName,
    });

    let user = await this.prisma.user.findUnique({ where: { email: profile.email } });
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: profile.email,
          fullName: profile.fullName || profile.email.split('@')[0],
          authProvider: dto.provider,
          providerId: profile.providerId,
          countryCode: (dto.countryCode || 'TR').toUpperCase(),
          emailVerified: true,
          status: 'PENDING',
        },
      });
      await this.audit.log(null, 'user.social_register', 'User', user.id, { provider: dto.provider });
    }

    const tokens = await this.issueTokens(user.id, user.email);
    return { ...tokens, user: this.publicUser(user), pendingApproval: user.status === 'PENDING' };
  }

  private sha(v: string) {
    return createHash('sha256').update(v).digest('hex');
  }

  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (exists) throw new BadRequestException('Bu e-posta zaten kayıtlı.');

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash: await argon2.hash(dto.password),
        fullName: dto.fullName,
        phone: dto.phone,
        memberType: dto.memberType,
        gender: dto.gender,
        countryCode: dto.countryCode.toUpperCase(),
        city: dto.city,
        invoiceType: dto.invoiceType ?? 'INDIVIDUAL',
        companyName: dto.companyName,
        taxOffice: dto.taxOffice,
        taxNumber: dto.taxNumber,
        locale: dto.locale ?? 'tr',
        status: 'PENDING', // yönetici onayı bekler; yine de ilan verebilir
      },
    });

    await this.sendCode(user.id, 'EMAIL', dto.email);
    if (dto.phone) await this.sendCode(user.id, 'SMS', dto.phone);

    await this.audit.log(null, 'user.register', 'User', user.id, { email: user.email });

    const tokens = await this.issueTokens(user.id, user.email);
    return { ...tokens, user: this.publicUser(user), pendingApproval: true };
  }

  async login(dto: LoginDto, ctx?: { ip?: string; userAgent?: string }) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    const fail = async () => {
      await this.prisma.securityEvent.create({ data: { type: 'login.fail', ip: ctx?.ip, userAgent: ctx?.userAgent, email: dto.email } }).catch(() => {});
    };
    if (!user || !user.passwordHash) { await fail(); throw new UnauthorizedException('Geçersiz bilgiler.'); }
    const ok = await argon2.verify(user.passwordHash, dto.password);
    if (!ok) { await fail(); throw new UnauthorizedException('Geçersiz bilgiler.'); }
    if (user.status === 'SUSPENDED' || user.status === 'REJECTED') {
      await this.prisma.securityEvent.create({ data: { type: 'login.blocked', ip: ctx?.ip, userAgent: ctx?.userAgent, email: dto.email, userId: user.id } }).catch(() => {});
      throw new UnauthorizedException('Hesabınız aktif değil.');
    }

    // Son IP / cihaz bilgisini kaydet (güvenlik izi)
    await this.prisma.user.update({ where: { id: user.id }, data: { lastIp: ctx?.ip, lastUserAgent: ctx?.userAgent, lastLoginAt: new Date() } }).catch(() => {});
    await this.prisma.securityEvent.create({ data: { type: 'login.ok', ip: ctx?.ip, userAgent: ctx?.userAgent, email: dto.email, userId: user.id } }).catch(() => {});

    const tokens = await this.issueTokens(user.id, user.email);
    return { ...tokens, user: this.publicUser(user) };
  }

  async verify(userId: string, channel: VerificationChannel, code: string) {
    const rec = await this.prisma.verification.findFirst({
      where: { userId, channel, consumedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    });
    if (!rec) throw new BadRequestException('Kod süresi doldu veya bulunamadı.');
    const ok = await argon2.verify(rec.codeHash, code);
    if (!ok) throw new BadRequestException('Kod hatalı.');

    await this.prisma.verification.update({ where: { id: rec.id }, data: { consumedAt: new Date() } });
    await this.prisma.user.update({
      where: { id: userId },
      data: channel === 'EMAIL' ? { emailVerified: true } : { phoneVerified: true },
    });
    return { verified: true, channel };
  }

  async refresh(refreshToken: string) {
    let payload: { sub: string; email: string };
    try {
      payload = await this.jwt.verifyAsync(refreshToken, {
        secret: this.config.get('jwt.refreshSecret'),
      });
    } catch {
      throw new UnauthorizedException('Geçersiz refresh token.');
    }
    const tokenHash = this.sha(refreshToken);
    const stored = await this.prisma.refreshToken.findUnique({ where: { tokenHash } });
    if (!stored || stored.revoked || stored.expiresAt < new Date())
      throw new UnauthorizedException('Refresh token geçersiz.');

    await this.prisma.refreshToken.update({ where: { id: stored.id }, data: { revoked: true } });
    return this.issueTokens(payload.sub, payload.email);
  }

  // Güvenli çıkış — refresh token'ı iptal eder. allDevices ise kullanıcının tüm oturumlarını kapatır.
  async logout(refreshToken?: string, allDevices?: boolean) {
    if (!refreshToken) return { ok: true };
    const tokenHash = this.sha(refreshToken);
    const stored = await this.prisma.refreshToken.findUnique({ where: { tokenHash } });
    if (stored) {
      if (allDevices) {
        await this.prisma.refreshToken.updateMany({ where: { userId: stored.userId, revoked: false }, data: { revoked: true } });
      } else {
        await this.prisma.refreshToken.update({ where: { id: stored.id }, data: { revoked: true } });
      }
      await this.audit.log(stored.userId, allDevices ? 'auth.logoutAll' : 'auth.logout', 'RefreshToken', stored.id);
    }
    return { ok: true };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { roles: { include: { role: true } }, consultantProfile: true },
    });
    if (!user) throw new UnauthorizedException();
    return this.publicUser(user);
  }

  // --- yardımcılar ---
  private async issueTokens(sub: string, email: string) {
    const accessToken = await this.jwt.signAsync(
      { sub, email },
      { secret: this.config.get('jwt.accessSecret'), expiresIn: this.config.get('jwt.accessTtl') },
    );
    // jti (benzersiz nonce) → aynı saniyede üretilen refresh token'ların hash çakışmasını önler
    const refreshToken = await this.jwt.signAsync(
      { sub, email, jti: randomUUID() },
      { secret: this.config.get('jwt.refreshSecret'), expiresIn: this.config.get('jwt.refreshTtl') },
    );
    const decoded: any = this.jwt.decode(refreshToken);
    await this.prisma.refreshToken.create({
      data: {
        userId: sub,
        tokenHash: this.sha(refreshToken),
        expiresAt: new Date((decoded.exp ?? 0) * 1000),
      },
    });
    return { accessToken, refreshToken };
  }

  private async sendCode(userId: string, channel: VerificationChannel, to: string) {
    const code = String(randomInt(100000, 999999));
    await this.prisma.verification.create({
      data: {
        userId,
        channel,
        codeHash: await argon2.hash(code),
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      },
    });
    if (channel === 'EMAIL') await this.mail.sendVerificationCode(to, code);
    else await this.sms.sendVerificationCode(to, code);
  }

  private publicUser(u: any) {
    return {
      id: u.id,
      email: u.email,
      fullName: u.fullName,
      memberType: u.memberType,
      gender: u.gender,
      status: u.status,
      emailVerified: u.emailVerified,
      phoneVerified: u.phoneVerified,
      countryCode: u.countryCode,
      city: u.city,
      locale: u.locale,
      roles: u.roles?.map((r: any) => r.role?.name) ?? [],
      isConsultant: !!u.consultantProfile,
      createdAt: u.createdAt,
      benefits: computeWomanBenefits(u),
    };
  }
}
