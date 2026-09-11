import { Controller, Get, Param, Post } from '@nestjs/common';
import { ListingsService } from './listings.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

// Ücretli danışman incelemesi: açık talepler + danışman "istekte bulun"
@Controller('review-requests')
export class ReviewController {
  constructor(private readonly listings: ListingsService) {}

  @Get('open')
  open() {
    return this.listings.openReviewRequests();
  }

  @Get('mine')
  mine(@CurrentUser('id') userId: string) {
    return this.listings.reviewRequestsForConsultant(userId);
  }

  @Post(':id/offer')
  offer(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.listings.offerReview(userId, id);
  }
}
