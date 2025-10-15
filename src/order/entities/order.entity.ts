import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column({ type: 'bigint' })
  paymentId: number;

  @Index()
  @Column({ type: 'bigint' })
  chatId: number;

  @Column()
  planId: string;

  @Column({
    type: 'varchar',
    enum: ['pending', 'completed', 'failed'],
    default: 'pending',
  })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}