import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ReportReason, ReportStatus } from '@prisma/client';

export class ReportDto {
  @IsEnum(ReportReason)
  reason: ReportReason;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string;
}

export class ResolveReportDto {
  @IsEnum(ReportStatus)
  status: ReportStatus;
}
