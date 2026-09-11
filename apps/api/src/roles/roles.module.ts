import { Module, Injectable, Controller, Get, Put, Param, Body } from '@nestjs/common';
import { IsArray, IsString } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { PERMISSIONS, ALL_PERMISSIONS } from '../common/enums/permission.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';

export class SetPermissionsDto {
  @IsArray() @IsString({ each: true }) permissionCodes: string[];
}

// Yönetici panosu rol & izin yönetimi (izin matrisi).
@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService, private audit: AuditService) {}

  async listRoles() {
    const roles = await this.prisma.role.findMany({
      include: { permissions: { include: { permission: true } } },
      orderBy: { name: 'asc' },
    });
    return roles.map((r) => ({
      id: r.id,
      name: r.name,
      label: r.label,
      isSystem: r.isSystem,
      permissions: r.permissions.map((rp) => rp.permission.code),
    }));
  }

  listPermissions() {
    return ALL_PERMISSIONS;
  }

  async setPermissions(adminId: string, roleId: string, codes: string[]) {
    const perms = await this.prisma.permission.findMany({ where: { code: { in: codes } } });
    await this.prisma.rolePermission.deleteMany({ where: { roleId } });
    await this.prisma.rolePermission.createMany({
      data: perms.map((p) => ({ roleId, permissionId: p.id })),
      skipDuplicates: true,
    });
    await this.audit.log(adminId, 'role.setPermissions', 'Role', roleId, { codes });
    return { roleId, permissions: perms.map((p) => p.code) };
  }
}

@Controller('admin')
class RolesController {
  constructor(private roles: RolesService) {}

  @Get('roles')
  @RequirePermissions(PERMISSIONS.ROLE_MANAGE)
  list() {
    return this.roles.listRoles();
  }

  @Get('permissions')
  @RequirePermissions(PERMISSIONS.ROLE_MANAGE)
  perms() {
    return this.roles.listPermissions();
  }

  @Put('roles/:id/permissions')
  @RequirePermissions(PERMISSIONS.ROLE_MANAGE)
  set(@CurrentUser('id') adminId: string, @Param('id') id: string, @Body() dto: SetPermissionsDto) {
    return this.roles.setPermissions(adminId, id, dto.permissionCodes);
  }
}

@Module({ controllers: [RolesController], providers: [RolesService] })
export class RolesModule {}
