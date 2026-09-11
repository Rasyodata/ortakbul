import { IsEmail, IsEnum, IsOptional, IsString, MinLength, Length } from 'class-validator';
import { Gender, InvoiceType, MemberType } from '@prisma/client';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @MinLength(2)
  fullName: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsEnum(MemberType)
  memberType: MemberType;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsString()
  @Length(2, 2)
  countryCode: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsEnum(InvoiceType)
  invoiceType?: InvoiceType;

  @IsOptional()
  @IsString()
  companyName?: string;

  @IsOptional()
  @IsString()
  taxOffice?: string;

  @IsOptional()
  @IsString()
  taxNumber?: string;

  @IsOptional()
  @IsString()
  locale?: string;
}
