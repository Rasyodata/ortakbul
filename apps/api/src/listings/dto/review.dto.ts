import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ReviewType } from '@prisma/client';

export class ReviewRequestDto {
  @IsEnum(ReviewType)
  type: ReviewType;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string;
}
