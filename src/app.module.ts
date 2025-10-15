import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TelegrafModule } from 'nestjs-telegraf';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BotModule } from './bot/bot.module';
import { MercadoPagoModule } from './mercado-pago/mercado-pago.module';
import { OrderModule } from './order/order.module';
import { NotificationModule } from './notification/notification.module';
import { UserModule } from './user/user.module';
import { Order } from './order/entities/order.entity';
import { User } from './user/entities/user.entity';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    
    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        token: configService.get<string>('TELEGRAM_BOT_TOKEN'),
      }),
      
      inject: [ConfigService],
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DATABASE_URL'),
        entities: [Order, User],
        synchronize: false,
      }),
    }),
    
    BotModule,
    MercadoPagoModule,
    OrderModule,
    NotificationModule,
    UserModule,

  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}