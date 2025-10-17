import { Controller, Logger, Post, HttpCode, Req } from '@nestjs/common';
import { Request } from 'express';
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
  @HttpCode(200)
  async handleWebhook(@Req() req: Request) {
    try {
      const rawBody = req.body;
      if (!rawBody || !(rawBody instanceof Buffer) || rawBody.length === 0) {
        this.logger.warn('Webhook do Mercado Pago recebido com corpo vazio ou inválido.');
        return;
      }
      
      const bodyAsString = rawBody.toString('utf-8');
      const body = JSON.parse(bodyAsString);

      this.logger.log(`Webhook do Mercado Pago recebido: ${bodyAsString}`);

      if (body?.type === 'payment' && body.data?.id) {
        const paymentId = body.data.id;
        const status = await this.mercadoPagoService.getPaymentStatus(paymentId);
        
        if (status === 'approved') {
          const order = await this.orderService.findByPaymentId(paymentId);
          if (!order || order.status === 'completed') {
            this.logger.warn(`Pedido para paymentId ${paymentId} não encontrado ou já completo.`);
            return;
          }
          
          this.logger.log(`Pagamento ${paymentId} aprovado. Atualizando pedido.`);
          await this.orderService.updateStatus(paymentId, 'completed');
          
          const plan = plans.find(p => p.id === order.planId);
          await this.notificationService.sendPaymentConfirmation(order.chatId, plan.name);
          await this.grantAccessToService(order.chatId, order.planId);
        }
      }
    } catch (error) {
      this.logger.error('Erro fatal ao processar webhook do Mercado Pago', error.stack);
    }
  }

  private async grantAccessToService(chatId: number, planId: string) {
    this.logger.log(`Concedendo acesso: Usuário ${chatId}, Plano ${planId}.`);
    try {
      await this.userService.grantPlanAccess(chatId, planId);
      if (planId === 'pro' || planId === 'premium') {
        await this.notificationService.sendPrivateGroupInvite(chatId);
      }
    } catch (error) {
      this.logger.error(`Erro em grantAccessToService para chatId ${chatId}`, error);
    }
  }
}