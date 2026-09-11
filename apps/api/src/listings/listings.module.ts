import { Module } from '@nestjs/common';
import { ListingsService } from './listings.service';
import { ListingsController } from './listings.controller';
import { AdminListingsController } from './admin-listings.controller';
import { AdminReportsController } from './admin-reports.controller';
import { ReviewController } from './review.controller';

@Module({
  controllers: [ListingsController, AdminListingsController, AdminReportsController, ReviewController],
  providers: [ListingsService],
  exports: [ListingsService],
})
export class ListingsModule {}
