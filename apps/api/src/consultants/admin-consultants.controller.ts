import { Controller, Get, Param, Post } from '@nestjs/common';
import { ConsultantsService } from './consultants.service';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { PERMISSIONS } from '../common/enums/permission.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('admin/consultants')
export class AdminConsultantsController {
  constructor(private readonly consultants: ConsultantsService) {}

  @Get('pending')
  @RequirePermissions(PERMISSIONS.CONSULTANT_APPROVE)
  pending() {
    return this.consultants.listPending();
  }

  @Post(':userId/approve')
  @RequirePermissions(PERMISSIONS.CONSULTANT_APPROVE)
  approve(@CurrentUser('id') adminId: string, @Param('userId') userId: string) {
    return this.consultants.approve(adminId, userId);
  }

  @Post(':userId/reject')
  @RequirePermissions(PERMISSIONS.CONSULTANT_APPROVE)
  reject(@CurrentUser('id') adminId: string, @Param('userId') userId: string) {
    return this.consultants.reject(adminId, userId);
  }
}
