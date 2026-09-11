import { Module, Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FxModule, FxService } from '../fx/fx.module';
import { Public } from '../common/decorators/public.decorator';

// Ana sayfa istatistikleri + genel config (gizli olmayan).
@Controller('meta')
class MetaController {
  constructor(private prisma: PrismaService, private fx: FxService) {}

  @Public()
  @Get()
  async meta() {
    const where = { status: 'APPROVED' as const };
    const [listings, consultants, usdTry, grouped, totalAgg, sectorRows, countryRows, women] = await Promise.all([
      this.prisma.listing.count({ where }),
      this.prisma.consultantProfile.count({ where: { status: 'APPROVED' } }),
      this.fx.getUsdTry(),
      this.prisma.listing.groupBy({ by: ['type'], where, _count: { _all: true }, _sum: { amountTL: true } }),
      this.prisma.listing.aggregate({ where, _sum: { amountTL: true } }),
      this.prisma.listing.findMany({ where, select: { category: true }, distinct: ['category'] }),
      this.prisma.listing.findMany({ where, select: { countryCode: true }, distinct: ['countryCode'] }),
      this.prisma.listing.count({ where: { ...where, owner: { is: { gender: 'FEMALE' as any } } } }),
    ]);

    const byType: Record<string, { count: number; valueTL: number }> = {};
    for (const g of grouped) byType[g.type] = { count: g._count._all, valueTL: g._sum.amountTL || 0 };

    // İş tipi (Json içinde) → Home Ofis & E-Ticaret toplamı
    const btRows = await this.prisma.listing.findMany({ where, select: { details: true, amountTL: true } });
    let ecomCount = 0, ecomValue = 0;
    for (const r of btRows) {
      const bt = (r.details as any)?.businessType;
      if (bt === 'Home Ofis' || bt === 'E-Ticaret') { ecomCount++; ecomValue += r.amountTL || 0; }
    }
    byType.ECOM = { count: ecomCount, valueTL: ecomValue };

    return {
      counts: {
        listings,
        consultants,
        targetUsers: 10000,
        sectors: sectorRows.filter((r) => r.category).length,
        countries: countryRows.filter((r) => r.countryCode).length,
        women,
      },
      totals: { valueTL: totalAgg._sum.amountTL || 0 },
      byType,
      fx: { usdTry },
    };
  }
}

@Module({ imports: [FxModule], controllers: [MetaController] })
export class MetaModule {}
