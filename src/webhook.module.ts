import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MercadoPagoModule } from './mercado-pago/mercado-pago.module';
import { OrderModule } from './order/order.module';
import { NotificationModule } from './notification/notification.module';
import { UserModule } from './user/user.module';
import { Order } from './order/entities/order.entity';
import { User } from './user/entities/user.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DATABASE_URL'),
        entities: [Order, User],
        synchronize: true, 
      }),
    }),
   
    MercadoPagoModule,
    OrderModule,
    NotificationModule,
    UserModule,
  ],
})
export class WebhookModule {}