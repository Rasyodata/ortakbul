import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ListingsService } from './listings.service';
import { ResolveReportDto } from './dto/report.dto';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { PERMISSIONS } from '../common/enums/permission.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('admin/reports')
export class AdminReportsController {
  constructor(private readonly listings: ListingsService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.LISTING_READ)
  list() {
    return this.listings.adminReports();
  }

  @Post(':id/resolve')
  @RequirePermissions(PERMISSIONS.LISTING_APPROVE)
  resolve(@CurrentUser('id') adminId: string, @Param('id') id: string, @Body() dto: ResolveReportDto) {
    return this.listings.resolveReport(adminId, id, dto.status);
  }
}
