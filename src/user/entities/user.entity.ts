import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column({ type: 'bigint' })
  chatId: number;

  @Column()
  firstName: string;

  @Column({ nullable: true })
  username?: string;

  @Column({ nullable: true })
  currentPlanId?: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  accessExpiresAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}