import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import configuration from './config/configuration';
import { PrismaModule } from './prisma/prisma.module';
import { AuditModule } from './audit/audit.module';
import { MailModule } from './mail/mail.module';
import { SmsModule } from './sms/sms.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ListingsModule } from './listings/listings.module';
import { ConsultantsModule } from './consultants/consultants.module';
import { PartnersModule } from './partners/partners.module';
import { AgentModule } from './agent/agent.module';
import { I18nModule } from './i18n/i18n.module';
import { FxModule } from './fx/fx.module';
import { ConsentModule } from './consent/consent.module';
import { MetaModule } from './meta/meta.module';
import { PaymentsModule } from './payments/payments.module';
import { RolesModule } from './roles/roles.module';
import { SettingsModule } from './settings/settings.module';
import { SecurityModule, IpBanGuard } from './security/security.module';
import { MatchModule } from './match/match.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { PermissionsGuard } from './common/guards/permissions.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 120 }]),
    PrismaModule,
    AuditModule,
    MailModule,
    SmsModule,
    AuthModule,
    UsersModule,
    ListingsModule,
    ConsultantsModule,
    PartnersModule,
    AgentModule,
    I18nModule,
    FxModule,
    ConsentModule,
    MetaModule,
    PaymentsModule,
    RolesModule,
    SettingsModule,
    SecurityModule,
    MatchModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: IpBanGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: PermissionsGuard },
  ],
})
export class AppModule {}
