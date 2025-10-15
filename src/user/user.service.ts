import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findOrCreate(chatId: number, firstName: string, username?: string): Promise<User> {
    let user = await this.userRepository.findOneBy({ chatId });
    if (user) {
      return user;
    }
    user = this.userRepository.create({ chatId, firstName, username });
    return this.userRepository.save(user);
  }

  async grantPlanAccess(chatId: number, planId: string): Promise<User> {
    const user = await this.findOrCreate(chatId, 'Unknown');
    const expirationDays = planId === 'pro' ? 90 : 30; // Exemplo de lógica de expiração
    const accessExpiresAt = new Date();
    accessExpiresAt.setDate(accessExpiresAt.getDate() + expirationDays);
    
    user.currentPlanId = planId;
    user.accessExpiresAt = accessExpiresAt;
    
    return this.userRepository.save(user);
  }
}