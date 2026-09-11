import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ListingsService } from './listings.service';
import { AdminCreateListingDto, AssignConsultantDto } from './dto/create-listing.dto';
import { QueryListingDto } from './dto/query-listing.dto';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { PERMISSIONS } from '../common/enums/permission.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('admin/listings')
export class AdminListingsController {
  constructor(private readonly listings: ListingsService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.LISTING_READ)
  list(@Query() q: QueryListingDto) {
    return this.listings.adminList(q);
  }

  // Üye adına ilan (ücretli paket ücretsiz atanabilir, doğrudan onaylı)
  @Post()
  @RequirePermissions(PERMISSIONS.LISTING_WRITE)
  createOnBehalf(@CurrentUser('id') adminId: string, @Body() dto: AdminCreateListingDto) {
    return this.listings.createByAdmin(adminId, dto);
  }

  @Post(':id/approve')
  @RequirePermissions(PERMISSIONS.LISTING_APPROVE)
  approve(@CurrentUser('id') adminId: string, @Param('id') id: string) {
    return this.listings.approve(adminId, id);
  }

  @Post(':id/reject')
  @RequirePermissions(PERMISSIONS.LISTING_APPROVE)
  reject(@CurrentUser('id') adminId: string, @Param('id') id: string) {
    return this.listings.setStatus(adminId, id, 'REJECTED');
  }

  @Post(':id/hold')
  @RequirePermissions(PERMISSIONS.LISTING_APPROVE)
  hold(@CurrentUser('id') adminId: string, @Param('id') id: string) {
    return this.listings.setStatus(adminId, id, 'PENDING');
  }

  // Denetimli ortaklık / danışmanlık ataması
  @Post(':id/assign')
  @RequirePermissions(PERMISSIONS.ASSIGNMENT_MANAGE)
  assign(
    @CurrentUser('id') adminId: string,
    @Param('id') id: string,
    @Body() dto: AssignConsultantDto,
  ) {
    return this.listings.assignConsultant(adminId, id, dto);
  }
}
