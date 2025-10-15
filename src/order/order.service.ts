import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
  ) {}

  async create(paymentId: number, chatId: number, planId: string): Promise<Order> {
    const newOrder = this.orderRepository.create({
      paymentId,
      chatId,
      planId,
      status: 'pending',
    });
    return this.orderRepository.save(newOrder);
  }

  async findByPaymentId(paymentId: number): Promise<Order | null> {
    return this.orderRepository.findOneBy({ paymentId });
  }

  async updateStatus(paymentId: number, status: 'completed' | 'failed'): Promise<Order> {
    const order = await this.findByPaymentId(paymentId);
    if (!order) {
      throw new NotFoundException(`Order with paymentId ${paymentId} not found.`);
    }
    order.status = status;
    return this.orderRepository.save(order);
  }
}