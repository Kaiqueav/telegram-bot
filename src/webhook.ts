import { NestFactory } from '@nestjs/core';
import { WebhookModule } from './webhook.module';
import * as express from 'express';

async function bootstrap() {
 
  const app = await NestFactory.create(WebhookModule);


  app.use(express.raw({ type: '*/*' }));

  await app.listen(process.env.PORT || 3001); 
}
bootstrap();