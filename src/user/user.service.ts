import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { BuyerDto } from './dto/buyer.dto';

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
    async save(user: User): Promise<User> {
      return this.userRepository.save(user);
    }
    

    async getBuyersForAdminPanel(): Promise<BuyerDto[]> {
      const allUsers = await this.userRepository.find();
      const now = new Date();

      return allUsers.map(user => {
        let subscriptionStatus: BuyerDto['subscriptionStatus'] = 'never_subscribed';
        let daysRemaining: number | undefined = undefined;

        if (user.accessExpiresAt) {
          if (user.accessExpiresAt > now) {
            subscriptionStatus = 'active';
            const diffTime = user.accessExpiresAt.getTime() - now.getTime();
            daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          } else {
            subscriptionStatus = 'expired'; 
            daysRemaining = 0;
          }
        }

        return {
          chatId: user.chatId,
          firstName: user.firstName,
          username: user.username,
          currentPlanId: user.currentPlanId,
          accessExpiresAt: user.accessExpiresAt,
          subscriptionStatus,
          daysRemaining,
        };
      });
    }
     async findExpiredUsers(): Promise<User[]> {
    return this.userRepository.find({
      where: {
        accessExpiresAt: LessThan(new Date()),
      },
    });
}

}