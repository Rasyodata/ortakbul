import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ListingTier, PaymentProvider } from '@prisma/client';

export class CheckoutDto {
  @IsString() listingId: string;

  @IsEnum(ListingTier) tier: ListingTier;

  @IsOptional() @IsEnum(PaymentProvider) provider?: PaymentProvider;
}
