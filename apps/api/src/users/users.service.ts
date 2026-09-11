import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { MailService } from '../mail/mail.service';
import { AdminCreateConsultantDto, AdminCreateMemberDto, SetRolesDto } from './dto/admin-user.dto';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
    private mail: MailService,
  ) {}

  async adminCreateMember(adminId: string, dto: AdminCreateMemberDto) {
    if (await this.prisma.user.findUnique({ where: { email: dto.email } }))
      throw new BadRequestException('Bu e-posta zaten kayıtlı.');

    const tempPassword = randomBytes(6).toString('base64url');
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        fullName: dto.fullName,
        phone: dto.phone,
        memberType: dto.memberType,
        countryCode: dto.countryCode.toUpperCase(),
        city: dto.city,
        passwordHash: await argon2.hash(tempPassword),
        status: 'APPROVED',
        emailVerified: true,
        createdByAdminId: adminId,
      },
    });
    await this.mail.send(
      dto.email,
      'ortakbul.org hesabınız oluşturuldu',
      `Yönetici tarafından hesabınız oluşturuldu. Geçici şifreniz: ${tempPassword} — ilk girişte değiştirin.`,
    );
    await this.audit.log(adminId, 'user.create', 'User', user.id, { email: user.email });
    return { id: user.id, email: user.email, status: user.status };
  }

  async adminCreateConsultant(adminId: string, dto: AdminCreateConsultantDto) {
    if (await this.prisma.user.findUnique({ where: { email: dto.email } }))
      throw new BadRequestException('Bu e-posta zaten kayıtlı.');

    const tempPassword = randomBytes(6).toString('base64url');
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        fullName: dto.fullName,
        memberType: 'CONSULTANT',
        countryCode: 'TR',
        city: dto.city,
        passwordHash: await argon2.hash(tempPassword),
        status: 'APPROVED',
        emailVerified: true,
        createdByAdminId: adminId,
        consultantProfile: {
          create: {
            category: dto.category,
            sector: dto.sector,
            experienceYears: dto.experienceYears,
            bio: dto.bio,
            feeText: dto.feeText,
            tags: [dto.category],
            verified: true,
            status: 'APPROVED',
          },
        },
      },
    });
    await this.audit.log(adminId, 'consultant.create', 'User', user.id, { email: user.email });
    return { id: user.id, email: user.email, status: user.status };
  }

  async approveMember(adminId: string, id: string) {
    await this.ensure(id);
    const user = await this.prisma.user.update({ where: { id }, data: { status: 'APPROVED' } });
    await this.audit.log(adminId, 'user.approve', 'User', id);
    return { id: user.id, status: user.status };
  }

  async rejectMember(adminId: string, id: string) {
    await this.ensure(id);
    const user = await this.prisma.user.update({ where: { id }, data: { status: 'REJECTED' } });
    await this.audit.log(adminId, 'user.reject', 'User', id);
    return { id: user.id, status: user.status };
  }

  listPending() {
    return this.prisma.user.findMany({
      where: { status: 'PENDING' },
      select: {
        id: true, email: true, fullName: true, memberType: true, countryCode: true,
        emailVerified: true, phoneVerified: true, createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  listMembers() {
    return this.prisma.user.findMany({
      select: {
        id: true, email: true, fullName: true, memberType: true, status: true,
        countryCode: true, createdByAdminId: true, createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 500,
    });
  }

  async setRoles(adminId: string, userId: string, dto: SetRolesDto) {
    await this.ensure(userId);
    const roles = await this.prisma.role.findMany({ where: { name: { in: dto.roleNames } } });
    await this.prisma.userRole.deleteMany({ where: { userId } });
    await this.prisma.userRole.createMany({
      data: roles.map((r) => ({ userId, roleId: r.id })),
      skipDuplicates: true,
    });
    await this.audit.log(adminId, 'user.setRoles', 'User', userId, { roles: dto.roleNames });
    return { userId, roles: roles.map((r) => r.name) };
  }

  private async ensure(id: string) {
    const u = await this.prisma.user.findUnique({ where: { id }, select: { id: true } });
    if (!u) throw new NotFoundException('Kullanıcı bulunamadı.');
  }
}
