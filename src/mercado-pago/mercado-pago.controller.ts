// src/mercadopago/mercadopago.controller.ts
import { Body, Controller, Logger, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { MercadoPagoService } from './mercado-pago.service';
import { OrderService } from '../order/order.service';
import { NotificationService } from '../notification/notification.service';

// Simulando a busca de dados do plano. Em um app real, isso poderia ser um serviço.
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
  ) {}

  @Post('webhook')
  async handleWebhook(@Body() body: any, @Res() res: Response) {

    res.status(200).send('OK');

    if (body.type === 'payment') {
      const paymentId = body.data.id;
      this.logger.log(`Webhook received for paymentId: ${paymentId}`);

      const order = this.orderService.findByPaymentId(paymentId);
      if (!order) {
        this.logger.warn(`Order not found for paymentId ${paymentId}. Ignoring webhook.`);
        return;
      }
      
      if (order.status === 'completed') {
        this.logger.log(`Order for paymentId ${paymentId} already completed. Ignoring.`);
        return;
      }
      
      
      const status = await this.mercadoPagoService.getPaymentStatus(paymentId);

      if (status === 'approved') {
        this.logger.log(`Payment ${paymentId} CONFIRMED as 'approved'.`);

        this.orderService.updateStatus(paymentId, 'completed');

        const plan = plans.find(p => p.id === order.planId);
        const planName = plan ? plan.name : 'Plano';
        await this.notificationService.sendPaymentConfirmation(order.chatId, planName);

      
        this.grantAccessToService(order.chatId, order.planId);
      }
    }
  }

  private grantAccessToService(chatId: number, planId: string) {
    this.logger.log(`GRANTING ACCESS: User ${chatId} purchased plan ${planId}.`);
  
  }
}