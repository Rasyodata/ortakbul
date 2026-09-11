import { IsEnum, IsString, Length } from 'class-validator';
import { VerificationChannel } from '@prisma/client';

export class VerifyDto {
  @IsEnum(VerificationChannel)
  channel: VerificationChannel;

  @IsString()
  @Length(4, 8)
  code: string;
}

export class RefreshDto {
  @IsString()
  refreshToken: string;
}
