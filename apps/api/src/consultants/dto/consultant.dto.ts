import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { ConsultantCategory } from '@prisma/client';

export class ApplyConsultantDto {
  @IsEnum(ConsultantCategory) category: ConsultantCategory;
  @IsString() sector: string;
  @IsOptional() @IsString() countryCode?: string;
  @IsOptional() @IsString() city?: string;
  @IsInt() @Min(0) experienceYears: number;
  @IsOptional() @IsString() bio?: string;
  @IsOptional() @IsString() feeText?: string;
  @IsOptional() tags?: string[];
}

export class AskQuestionDto {
  @IsOptional() @IsString() listingId?: string;
  @IsString() question: string;
}

export class AnswerQuestionDto {
  @IsString() answer: string;
}

export class QueryConsultantDto {
  @IsOptional() @IsEnum(ConsultantCategory) category?: ConsultantCategory;
  @IsOptional() @IsString() sector?: string;
  @IsOptional() @IsString() search?: string;
}
