import { Module } from '@nestjs/common';
import { MercadoPagoService } from './mercado-pago.service';
import { MercadoPagoController } from './mercado-pago.controller';
import { OrderModule } from 'src/order/order.module';
import { NotificationModule } from 'src/notification/notification.module';
import { UserModule } from 'src/user/user.module';


@Module({
    imports: [OrderModule, NotificationModule, UserModule],
  providers: [MercadoPagoService],
  exports: [MercadoPagoService],
  controllers: [MercadoPagoController]
})
export class MercadoPagoModule {}
