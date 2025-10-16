import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}
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
  
  @Column({
      type: 'enum',
      enum: UserRole,
      default: UserRole.USER,
    })
  role: UserRole;
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}