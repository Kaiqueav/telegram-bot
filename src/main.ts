// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getBotToken } from 'nestjs-telegraf';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const bot = app.get(getBotToken());

  const webhookPath = `/telegraf`;

  app.use(bot.webhookCallback(webhookPath));
  if (process.env.NODE_ENV === 'production') {
    const domain = process.env.BOT_DOMAIN;
    if (!domain) {
      throw new Error('A variável de ambiente BOT_DOMAIN não está definida!');
    }
    const webhookUrl = `https://${domain}${webhookPath}`;
    await bot.telegram.setWebhook(webhookUrl);
    console.log(`Webhook configurado para: ${webhookUrl}`);
  }

  await app.listen(process.env.PORT || 3000);
}
bootstrap();