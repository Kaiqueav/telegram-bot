import { Body, Controller, Logger, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { MercadoPagoService } from './mercado-pago.service';
import { OrderService } from '../order/order.service';
import { NotificationService } from '../notification/notification.service';
import { UserService } from '../user/user.service';
const plans = [
    { id: 'basic', name: 'Plano Básico' },
    { id: 'pro', name: 'Plano Pro' },
    { id: 'premium', name: 'Plano Premium' },
];

@Controller('mercadopago')
export class MercadoPagoController {
  private readonly logger = new Logger(MercadoPagoController.name);

  constructor(
   //private readonly mercadoPagoService: MercadoPagoService,
    //private readonly orderService: OrderService,
    //private readonly notificationService: NotificationService,
    //private readonly userService: UserService,

  ) {}

  @Post('webhook')
  async handleWebhook(@Body() body: any, @Res() res: Response) {
   this.logger.log('>>>>>>>>>> WEBHOOK ENDPOINT ATINGIDO <<<<<<<<<<');

    // 2. VERIFICA SE O BODY EXISTE E LOGA O CONTEÚDO
    if (body) {
      // Usamos JSON.stringify para garantir que objetos aninhados sejam visíveis.
      this.logger.log(`CONTEÚDO DO BODY: ${JSON.stringify(body, null, 2)}`);
    } else {
      this.logger.warn('ALERTA: Webhook recebido com BODY VAZIO ou NULO.');
    }

    // 3. LOG FINAL ANTES DE ENCERRAR
    this.logger.log('>>>>>>>>>> PROCESSAMENTO DO WEBHOOK FINALIZADO (DEBUG MODE) <<<<<<<<<<');
  }

  
  /*private async grantAccessToService(chatId: number, planId: string) {
    this.logger.log(`GRANTING ACCESS: User ${chatId} purchased plan ${planId}.`);
    try {
    
      await this.userService.grantPlanAccess(chatId, planId);
      this.logger.log(`User ${chatId} access rights saved to database.`);

  
      if (planId === 'pro' || planId === 'premium') {
        await this.notificationService.sendPrivateGroupInvite(chatId);
      }
      
  

    } catch (error) {
      this.logger.error(`Error in grantAccessToService for chatId ${chatId}`, error);

    }
  }*/
}