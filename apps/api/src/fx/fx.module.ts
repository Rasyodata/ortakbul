import { Module, Injectable, Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { Public } from '../common/decorators/public.decorator';

// Döviz kuru: her dilde $ dönüşümü için. Production'da canlı API'den güncellenir.
@Injectable()
export class FxService {
  constructor(private prisma: PrismaService, private config: ConfigService) {}

  async getUsdTry(): Promise<number> {
    const rec = await this.prisma.fxRate.findUnique({ where: { base_quote: { base: 'USD', quote: 'TRY' } } });
    return rec?.rate ?? this.config.get<number>('fx.usdTry') ?? 41;
  }

  async toUsd(tl: number): Promise<number> {
    const rate = await this.getUsdTry();
    return Math.round(tl / rate);
  }
}

@Controller('fx')
class FxController {
  constructor(private fx: FxService) {}
  @Public()
  @Get()
  async rates() {
    const usdTry = await this.fx.getUsdTry();
    return { base: 'TRY', usdTry, updatedAt: new Date().toISOString() };
  }
}

@Module({ controllers: [FxController], providers: [FxService], exports: [FxService] })
export class FxModule {}
