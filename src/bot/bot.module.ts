import { Module } from '@nestjs/common';
import { BotUpdate } from './bot.update';
import { ConfigModule } from '@nestjs/config';
import { MercadoPagoModule } from 'src/mercado-pago/mercado-pago.module';
import { UserModule } from 'src/user/user.module';
import { OrderModule } from 'src/order/order.module';


@Module({
    imports:[MercadoPagoModule, ConfigModule, UserModule, OrderModule],
providers:[BotUpdate]
})
export class BotModule {}
