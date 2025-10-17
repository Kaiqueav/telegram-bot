import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
import { getBotToken } from 'nestjs-telegraf';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.use('/mercadopago/webhook', express.raw({ type: '*/*' }));
  const bot = app.get(getBotToken());
  app.use(bot.webhookCallback('/telegraf'));

  await app.listen(process.env.PORT || 3000);
}
bootstrap();