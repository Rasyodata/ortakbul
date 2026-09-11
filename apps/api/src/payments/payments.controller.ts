import { Body, Controller, Get, Headers, Param, Post, Req } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CheckoutDto } from './dto/checkout.dto';
import { Public } from '../common/decorators/public.decorator';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { PERMISSIONS } from '../common/enums/permission.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  // Üye: paket satın alma başlat
  @Post('checkout')
  checkout(@CurrentUser('id') userId: string, @Body() dto: CheckoutDto) {
    return this.payments.checkout(userId, dto);
  }

  // Sağlayıcı webhook'u (imza doğrulama sağlayıcı adaptöründe)
  @Public()
  @Post('webhook/:provider')
  webhook(@Param('provider') provider: string, @Body() payload: any, @Headers() headers: Record<string, any>) {
    return this.payments.handleWebhook(provider, payload, headers);
  }
}

@Controller('admin/payments')
export class AdminPaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.PAYMENT_READ)
  list() {
    return this.payments.adminList();
  }
}
