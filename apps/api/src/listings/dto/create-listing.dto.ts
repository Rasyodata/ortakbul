import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import {
  ListingTier,
  ListingType,
  PartnershipStructure,
  PartnershipType,
  SalePaymentType,
} from '@prisma/client';

export class CreateListingDto {
  @IsEnum(ListingType)
  type: ListingType;

  @IsOptional()
  @IsEnum(ListingTier)
  tier?: ListingTier; // ilan verirken seçilen paket

  @IsString()
  @MinLength(2)
  title: string;

  @IsString()
  @MinLength(2)
  short: string;

  @IsString()
  @MinLength(2)
  detail: string;

  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsString() sector?: string;
  @IsOptional() @IsString() countryCode?: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() amountText?: string;
  @IsOptional() @IsInt() amountTL?: number;

  // IDEA
  @IsOptional() @IsString() stage?: string;
  @IsOptional() @IsString() problem?: string;
  @IsOptional() @IsString() audience?: string;
  @IsOptional() @IsEnum(PartnershipStructure) structure?: PartnershipStructure;

  // PARTNERSHIP
  @IsOptional() @IsEnum(PartnershipType) partnershipType?: PartnershipType;
  @IsOptional() @IsBoolean() audited?: boolean;

  // COMPANY_SALE
  @IsOptional() @IsString() price?: string;
  @IsOptional() @IsInt() foundedYear?: number;
  @IsOptional() @IsString() employees?: string;
  @IsOptional() @IsString() revenue?: string;
  @IsOptional() @IsString() reason?: string;
  @IsOptional() @IsEnum(SalePaymentType) salePaymentType?: SalePaymentType;

  // FRANCHISE
  @IsOptional() @IsString() franchiseKind?: string;
  @IsOptional() @IsInt() investTL?: number;

  // INVESTOR_CAPITAL
  @IsOptional() @IsString() capitalTier?: string;
  @IsOptional() sectors?: string[];

  // Şirket künyesi / mali-hukuki durum (COMPANY_SALE): ortaklık yapısı, ortak sayısı,
  // sermaye, piyasa/resmi/personel borcu, icra-haciz, davalar, ruhsatlar vb.
  @IsOptional() @IsObject() details?: Record<string, any>;
}

export class AdminCreateListingDto extends CreateListingDto {
  @IsString()
  ownerId: string;

  @IsOptional()
  @IsEnum(ListingTier)
  tier?: ListingTier; // admin ücretsiz atayabilir
}

export class AssignConsultantDto {
  @IsString()
  consultantUserId: string;

  @IsOptional()
  @IsEnum(['CONSULTANT', 'AUDITOR'])
  role?: 'CONSULTANT' | 'AUDITOR';
}
