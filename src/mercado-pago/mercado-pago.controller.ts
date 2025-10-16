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
    private readonly mercadoPagoService: MercadoPagoService,
    private readonly orderService: OrderService,
    private readonly notificationService: NotificationService,
    private readonly userService: UserService,

  ) {}

  @Post('webhook')
  async handleWebhook(@Body() body: any, @Res() res: Response) {
   try {
      this.logger.log('====== WEBHOOK RECEBIDO ======');
      this.logger.log(`BODY: ${JSON.stringify(body, null, 2)}`);

      if (body?.type !== 'payment' || !body.data?.id) {
        this.logger.warn('Webhook não parece ser uma notificação de pagamento válida. Ignorando.');
        return; // Sai silenciosamente se o corpo não for o esperado
      }

      const paymentId = body.data.id;
      this.logger.log(`Processando notificação para o paymentId: ${paymentId}`);

      const order = await this.orderService.findByPaymentId(paymentId);
      if (!order || order.status === 'completed') {
        this.logger.warn(`Pedido não encontrado ou já completo para o paymentId ${paymentId}. Ignorando.`);
        return;
      }
      
      const status = await this.mercadoPagoService.getPaymentStatus(paymentId);

      if (status === 'approved') {
        this.logger.log(`Pagamento ${paymentId} CONFIRMADO como 'approved'.`);
        await this.orderService.updateStatus(paymentId, 'completed');
        
        const plan = plans.find(p => p.id === order.planId);
        const planName = plan ? plan.name : 'Seu Plano';
        await this.notificationService.sendPaymentConfirmation(order.chatId, planName);

        await this.grantAccessToService(order.chatId, order.planId);
      } else {
         this.logger.log(`Status do pagamento ${paymentId} é '${status}'. Ainda não aprovado.`);
      }

      this.logger.log('====== WEBHOOK PROCESSADO COM SUCESSO ======');

    } catch (error) {
      // Se qualquer coisa dentro do 'try' falhar, o código abaixo será executado
      this.logger.error('!!!!!! ERRO FATAL AO PROCESSAR O WEBHOOK !!!!!!');
      this.logger.error(`Erro: ${error.message}`, error.stack);
    }
  }

  
  private async grantAccessToService(chatId: number, planId: string) {
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
  }
}