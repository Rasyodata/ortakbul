import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { AdminPaymentsController, PaymentsController } from './payments.controller';

@Module({
  controllers: [PaymentsController, AdminPaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
