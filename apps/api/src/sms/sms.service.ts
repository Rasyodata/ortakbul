import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// Sağlayıcı soyutlaması: production'da Netgsm/Twilio bağlanır.
@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  constructor(private config: ConfigService) {}

  async sendVerificationCode(to: string, code: string): Promise<void> {
    await this.send(to, `ortakbul.org dogrulama kodunuz: ${code}`);
  }

  async send(to: string, message: string): Promise<void> {
    const provider = this.config.get<string>('sms.provider');
    // TODO(production): provider === 'netgsm' | 'twilio' entegrasyonu
    this.logger.log(`[SMS:${provider}] → ${to} | ${message}`);
  }
}
