import { IsEmail, IsEnum, IsInt, IsOptional, IsString, Length, Min } from 'class-validator';
import { ConsultantCategory, MemberType } from '@prisma/client';

export class AdminCreateMemberDto {
  @IsEmail() email: string;
  @IsString() fullName: string;
  @IsEnum(MemberType) memberType: MemberType;
  @IsString() @Length(2, 2) countryCode: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() phone?: string;
}

export class AdminCreateConsultantDto {
  @IsEmail() email: string;
  @IsString() fullName: string;
  @IsEnum(ConsultantCategory) category: ConsultantCategory;
  @IsString() sector: string;
  @IsString() city: string;
  @IsInt() @Min(0) experienceYears: number;
  @IsOptional() @IsString() bio?: string;
  @IsOptional() @IsString() feeText?: string;
}

export class SetRolesDto {
  @IsString({ each: true })
  roleNames: string[];
}
