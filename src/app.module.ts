import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TelegrafModule } from 'nestjs-telegraf';
import { BotModule } from './bot/bot.module';
import { MercadoPagoModule } from './mercado-pago/mercado-pago.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true}),
    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        token: configService.get<string>('TELEGRAM_BOT_TOKEN'),
      }),
        inject: [ConfigService], 
    }),
    BotModule,
    MercadoPagoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
