import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

// KVKK/güvenlik: kritik işlemler denetim loguna yazılır.
@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async log(
    actorId: string | null,
    action: string,
    entityType?: string,
    entityId?: string,
    meta?: Record<string, any>,
    ip?: string,
  ) {
    await this.prisma.auditLog.create({
      data: { actorId: actorId ?? undefined, action, entityType, entityId, meta, ip },
    });
  }
}
