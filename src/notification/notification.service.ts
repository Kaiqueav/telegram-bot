import { Injectable, Logger } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);


  constructor(@InjectBot() private readonly bot: Telegraf) {}

  async sendPaymentConfirmation(chatId: number, planName: string) {
    try {
      const message = `✅ Pagamento confirmado!\n\nSeu *${planName}* foi ativado com sucesso. Obrigado por sua compra!`;
      
      await this.bot.telegram.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
      });
      
      this.logger.log(`Confirmation message sent to chatId ${chatId}`);
    } catch (error) {
      
      this.logger.error(`Failed to send message to chatId ${chatId}`, error);
    }
  }
}