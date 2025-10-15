import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { UserModule } from 'src/user/user.module';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [ UserModule, NotificationModule],
  providers: [TaskService]
})
export class TaskModule {}
