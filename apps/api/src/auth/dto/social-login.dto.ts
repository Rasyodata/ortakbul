import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { AuthProvider } from '@prisma/client';

export class SocialLoginDto {
  @IsEnum(AuthProvider)
  provider: AuthProvider; // GOOGLE | APPLE | FACEBOOK | INSTAGRAM | TIKTOK

  // Provider'dan gelen id_token / access_token (production'da doğrulanır)
  @IsString()
  token: string;

  // Scaffold: provider profilinden gelmesi beklenen alanlar
  @IsEmail()
  email: string;

  @IsOptional() @IsString() fullName?: string;
  @IsOptional() @IsString() countryCode?: string;
}
