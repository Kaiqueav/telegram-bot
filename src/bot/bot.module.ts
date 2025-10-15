import { Module } from '@nestjs/common';
import { BotUpdate } from './bot.update';
import { ConfigModule } from '@nestjs/config';
import { MercadoPagoModule } from 'src/mercado-pago/mercado-pago.module';


@Module({
    imports:[MercadoPagoModule, ConfigModule],
providers:[BotUpdate]
})
export class BotModule {}
