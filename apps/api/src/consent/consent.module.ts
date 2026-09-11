import { Module, Controller, Post, Body, Req } from '@nestjs/common';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';
import { Public } from '../common/decorators/public.decorator';

// KVKK/GDPR çerez onayı kaydı (giriş yapmamış ziyaretçi de kaydedebilir).
export class ConsentDto {
  @IsOptional() @IsBoolean() necessary?: boolean;
  @IsOptional() @IsBoolean() analytics?: boolean;
  @IsOptional() @IsBoolean() marketing?: boolean;
  @IsOptional() @IsString() anonId?: string;
  @IsOptional() @IsString() userId?: string;
}

@Controller('consent')
class ConsentController {
  constructor(private prisma: PrismaService) {}

  @Public()
  @Post()
  async record(@Body() dto: ConsentDto, @Req() req: any) {
    return this.prisma.consent.create({
      data: {
        userId: dto.userId,
        anonId: dto.anonId,
        necessary: dto.necessary ?? true,
        analytics: dto.analytics ?? false,
        marketing: dto.marketing ?? false,
        ip: req.ip,
        userAgent: req.headers?.['user-agent'],
      },
    });
  }
}

@Module({ controllers: [ConsentController] })
export class ConsentModule {}
