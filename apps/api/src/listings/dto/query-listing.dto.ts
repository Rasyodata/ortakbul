import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ListingType, PartnershipType } from '@prisma/client';

export class QueryListingDto {
  @IsOptional() @IsEnum(ListingType) type?: ListingType;
  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsString() sector?: string;
  @IsOptional() @IsString() countryCode?: string;
  @IsOptional() @IsString() stage?: string;
  @IsOptional() @IsEnum(PartnershipType) partnershipType?: PartnershipType;
  @IsOptional() @IsString() audited?: string; // '1' | '0'
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsString() capitalTier?: string;
  @IsOptional() @IsString() ownerGender?: string; // FEMALE → kadın girişimci ilanları
  @IsOptional() @IsString() maxAmountTL?: string;  // 500000 → melek yatırımcı fırsatları (küçük ticket)
  @IsOptional() @IsString() salePaymentType?: string; // CASH | INSTALLMENT | BARTER
}
