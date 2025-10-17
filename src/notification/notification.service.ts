import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Telegraf } from 'telegraf';

@Injectable()
export class NotificationService implements OnModuleInit {
  private readonly logger = new Logger(NotificationService.name);
  private bot: Telegraf; 
  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
   
    const token = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
    if (!token) {
      throw new Error('TELEGRAM_BOT_TOKEN not found in environment variables.');
    }
    this.bot = new Telegraf(token);
    this.logger.log('Telegraf client initialized for sending messages.');
  }

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

  async sendPrivateGroupInvite(chatId: number): Promise<void> {
    try {
      const groupId = this.configService.get<string>('PRIVATE_GROUP_ID');
      if (!groupId) {
        this.logger.error('PRIVATE_GROUP_ID not set.');
        return;
      }

      const inviteLink = await this.bot.telegram.createChatInviteLink(groupId, {
        expire_date: Math.floor(Date.now() / 1000) + 3600, 
        member_limit: 1, 
      });

      const message =
        `Seu acesso foi liberado!\n\n` +
        `Clique no link abaixo para entrar no nosso grupo exclusivo. ` +
        `Lembre-se que este link é de uso único e expira em 1 hora.`;

      await this.bot.telegram.sendMessage(chatId, message, {
        reply_markup: {
          inline_keyboard: [[{ text: 'Entrar no Grupo', url: inviteLink.invite_link }]],
        },
      });
      this.logger.log(`Invite link sent to chatId ${chatId}`);
    } catch (error) {
      this.logger.error(`Failed to send invite link to chatId ${chatId}`, error);
    }
  }

  async removeUserFromGroup(groupId: string, userId: number): Promise<void> {
    try {
      await this.bot.telegram.banChatMember(groupId, userId);
      await this.bot.telegram.unbanChatMember(groupId, userId);
      this.logger.log(`User ${userId} removed from group ${groupId}.`);
    } catch (error) {
      this.logger.error(`Failed to remove user ${userId} from group ${groupId}.`, error);
      throw error;
    }
  }
}