import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ListingsService } from './listings.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { QueryListingDto } from './dto/query-listing.dto';
import { ReportDto } from './dto/report.dto';
import { ReviewRequestDto } from './dto/review.dto';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('listings')
export class ListingsController {
  constructor(private readonly listings: ListingsService) {}

  @Public()
  @Get()
  list(@Query() q: QueryListingDto) {
    return this.listings.publicList(q);
  }

  @Post()
  create(@CurrentUser('id') userId: string, @Body() dto: CreateListingDto) {
    return this.listings.createByOwner(userId, dto);
  }

  @Get('mine')
  mine(@CurrentUser('id') userId: string) {
    return this.listings.myListings(userId);
  }

  // Danışman: yalnızca kendisine atanan ilanlar
  @Get('assigned')
  assigned(@CurrentUser('id') userId: string) {
    return this.listings.assignedToMe(userId);
  }

  // İhbar / şikayet (üye)
  @Post(':id/report')
  report(@CurrentUser('id') userId: string, @Param('id') id: string, @Body() dto: ReportDto) {
    return this.listings.report(userId, id, dto.reason, dto.note);
  }

  // Ücretli danışman incelemesi talebi (üye)
  @Post(':id/review-request')
  reviewRequest(@CurrentUser('id') userId: string, @Param('id') id: string, @Body() dto: ReviewRequestDto) {
    return this.listings.createReviewRequest(userId, id, dto.type, dto.note);
  }

  @Public()
  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.listings.getOne(id);
  }
}
