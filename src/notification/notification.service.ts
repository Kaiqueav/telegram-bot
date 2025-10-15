import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectBot } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);


  constructor(@InjectBot() 
    private readonly bot: Telegraf,
    private readonly configService: ConfigService) {}

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
        this.logger.error('PRIVATE_GROUP_ID not set in environment variables.');
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
      // Possíveis erros: bot não é admin, ID do grupo está errado, etc.
    }
  }
   async removeUserFromGroup(groupId: string, userId: number): Promise<void> {
    try {
      //banindo
      await this.bot.telegram.banChatMember(groupId, userId);
      // retirando o ban
      await this.bot.telegram.unbanChatMember(groupId, userId);
      
      this.logger.log(`Utilizador ${userId} removido com sucesso do grupo ${groupId}.`);
    } catch (error) {
      this.logger.error(`Falha ao remover o utilizador ${userId} do grupo ${groupId}.`, error);
      throw error;
    }
  }
}