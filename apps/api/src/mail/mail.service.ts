import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// Sağlayıcı soyutlaması: production'da SMTP/SendGrid bağlanır.
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  constructor(private config: ConfigService) {}

  async sendVerificationCode(to: string, code: string): Promise<void> {
    await this.send(to, 'ortakbul.org doğrulama kodu', `Doğrulama kodunuz: ${code}`);
  }

  async send(to: string, subject: string, body: string): Promise<void> {
    const provider = this.config.get<string>('mail.provider');
    // TODO(production): provider === 'smtp' | 'sendgrid' entegrasyonu
    this.logger.log(`[MAIL:${provider}] → ${to} | ${subject} | ${body}`);
  }
}
