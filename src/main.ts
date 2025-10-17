import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
import { getBotToken } from 'nestjs-telegraf';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    
    bodyParser: false,
  });

  const rawBodyMiddleware = express.raw({ type: '*/*' });
  const jsonBodyMiddleware = express.json();

  app.use((req, res, next) => {
    if (req.url === '/mercadopago/webhook') {
      
      rawBodyMiddleware(req, res, next);
    } else {

      jsonBodyMiddleware(req, res, next);
    }
  });
  
  const bot = app.get(getBotToken());
  app.use(bot.webhookCallback('/telegraf'));

  await app.listen(process.env.PORT || 3000);
}
bootstrap();