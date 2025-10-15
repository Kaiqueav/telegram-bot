import { Injectable, NotFoundException } from '@nestjs/common';

export interface Order {
  paymentId: number;
  chatId: number;
  planId: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
}

@Injectable()
export class OrderService {

  private readonly orders: Order[] = [];

  create(paymentId: number, chatId: number, planId: string): Order {
    const newOrder: Order = {
      paymentId,
      chatId,
      planId,
      status: 'pending',
      createdAt: new Date(),
    };
    this.orders.push(newOrder);
    return newOrder;
  }

  findByPaymentId(paymentId: number): Order | null {
    const order = this.orders.find(o => o.paymentId === Number(paymentId));
    if (!order) {
      
      return null;
    }
    return order;
  }

  updateStatus(paymentId: number, status: 'completed' | 'failed'): Order {
    const order = this.findByPaymentId(paymentId);
    if (!order) {
      throw new NotFoundException(`Order with paymentId ${paymentId} not found.`);
    }
    order.status = status;
    return order;
  }
}