import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TelegrafModule } from 'nestjs-telegraf';
import { BotModule } from './bot/bot.module';
import { PixModule } from './pix/pix.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true}),
    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        token: configService.get<string>('TELEGRAM_BOT_TOKEN'),
      }),
    }),
    BotModule,
    PixModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
