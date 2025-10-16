export class BuyerDto {
  chatId: number;
  firstName: string;
  username?: string;
  currentPlanId?: string;
  accessExpiresAt?: Date;
  subscriptionStatus: 'active' | 'expired' | 'never_subscribed';
  daysRemaining?: number;
}