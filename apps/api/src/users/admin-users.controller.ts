import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { AdminCreateConsultantDto, AdminCreateMemberDto, SetRolesDto } from './dto/admin-user.dto';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { PERMISSIONS } from '../common/enums/permission.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('admin/users')
export class AdminUsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.USER_READ)
  list() {
    return this.users.listMembers();
  }

  @Get('pending')
  @RequirePermissions(PERMISSIONS.USER_READ)
  pending() {
    return this.users.listPending();
  }

  @Post('member')
  @RequirePermissions(PERMISSIONS.USER_WRITE)
  createMember(@CurrentUser('id') adminId: string, @Body() dto: AdminCreateMemberDto) {
    return this.users.adminCreateMember(adminId, dto);
  }

  @Post('consultant')
  @RequirePermissions(PERMISSIONS.USER_WRITE)
  createConsultant(@CurrentUser('id') adminId: string, @Body() dto: AdminCreateConsultantDto) {
    return this.users.adminCreateConsultant(adminId, dto);
  }

  @Post(':id/approve')
  @RequirePermissions(PERMISSIONS.USER_APPROVE)
  approve(@CurrentUser('id') adminId: string, @Param('id') id: string) {
    return this.users.approveMember(adminId, id);
  }

  @Post(':id/reject')
  @RequirePermissions(PERMISSIONS.USER_APPROVE)
  reject(@CurrentUser('id') adminId: string, @Param('id') id: string) {
    return this.users.rejectMember(adminId, id);
  }

  @Post(':id/roles')
  @RequirePermissions(PERMISSIONS.ROLE_MANAGE)
  setRoles(@CurrentUser('id') adminId: string, @Param('id') id: string, @Body() dto: SetRolesDto) {
    return this.users.setRoles(adminId, id, dto);
  }
}
