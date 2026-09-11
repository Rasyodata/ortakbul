import { Module } from '@nestjs/common';
import { Controller, Get, Post } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { Public } from '../common/decorators/public.decorator';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { PERMISSIONS } from '../common/enums/permission.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';

// AI ajan: arka planda sektör haber/fırsat/rekabet taraması yapıp rapor üretir.
// Production'da: zamanlanmış iş (BullMQ) + haber API + LLM özetleme + kişiselleştirilmiş bildirim.
@Controller()
class AgentController {
  constructor(private prisma: PrismaService, private audit: AuditService) {}

  @Public()
  @Get('agent/reports')
  reports() {
    return this.prisma.agentReport.findMany({ orderBy: { createdAt: 'desc' }, take: 50 });
  }

  @Post('admin/agent/run')
  @RequirePermissions(PERMISSIONS.AGENT_RUN)
  async run(@CurrentUser('id') adminId: string) {
    // TODO(production): gerçek tarama işi kuyruğa alınır.
    const report = await this.prisma.agentReport.create({
      data: {
        tag: 'Yeni',
        title: 'Ajan taraması tamamlandı: yeni fırsatlar bulundu',
        body: 'Sektör verilerinde uygun destek/fon programları tespit edildi. İlgili kullanıcılara bildirim önerildi.',
        source: 'Ajan taraması',
      },
    });
    await this.audit.log(adminId, 'agent.run', 'AgentReport', report.id);
    return report;
  }
}

@Module({ controllers: [AgentController] })
export class AgentModule {}
