import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NotificationService } from 'src/notification/notification.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class TaskService {

    private readonly logger = new Logger(TaskService.name)
    constructor(
        private readonly userService: UserService,
        private readonly notificationService: NotificationService,
        private readonly configService: ConfigService,
    ){}

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleExpiredSubscriptions() {
    this.logger.log('A executar verificação de assinaturas expiradas...');

    const expiredUsers = await this.userService.findExpiredUsers();
    if (expiredUsers.length === 0) {
      this.logger.log('Nenhuma assinatura expirada encontrada.');
      return;
    }

    const groupId = this.configService.get<string>('PRIVATE_GROUP_ID');
    if (!groupId) {
      this.logger.error('PRIVATE_GROUP_ID não definido. A abortar a remoção de membros.');
      return;
    }

    for (const user of expiredUsers) {
      try {
        await this.notificationService.removeUserFromGroup(groupId, user.chatId);
        
        user.currentPlanId = null;
        user.accessExpiresAt = null;
        await this.userService.save(user);
        
        this.logger.log(`Utilizador ${user.chatId} removido do grupo por assinatura expirada.`);
      } catch (error) {
        this.logger.error(`Falha ao remover o utilizador ${user.chatId} do grupo.`, error.stack);
      }
    }
    this.logger.log('Verificação de assinaturas expiradas concluída.');
  }
}
