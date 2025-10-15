import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';

import { UserService } from '../user/user.service';
import { NotificationService } from '../notification/notification.service';
import { User } from '../user/entities/user.entity';
import { TaskService } from './task.service';

describe('TasksService', () => {
  let taskService: TaskService;
  let userService: UserService;
  let notificationService: NotificationService;

  const mockUserService = {
    findExpiredUsers: jest.fn(),
    save: jest.fn(user => Promise.resolve(user)), // Simula o salvamento
  };

  const mockNotificationService = {
    removeUserFromGroup: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('-1001234567890'), // Mock para o PRIVATE_GROUP_ID
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        { provide: UserService, useValue: mockUserService },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    taskService = module.get<TaskService>(TaskService);
    userService = module.get<UserService>(UserService);
    notificationService = module.get<NotificationService>(NotificationService);
  });


  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve ser definido', () => {
    expect(taskService).toBeDefined();
  });

  describe('handleExpiredSubscriptions', () => {
    it('não deve fazer nada se não houver utilizadores expirados', async () => {
      mockUserService.findExpiredUsers.mockResolvedValue([]);

      await taskService.handleExpiredSubscriptions();

      expect(userService.findExpiredUsers).toHaveBeenCalledTimes(1);
      expect(notificationService.removeUserFromGroup).not.toHaveBeenCalled();
    });

    it('deve remover utilizadores expirados e limpar os seus dados de assinatura', async () => {
      const expiredUsers: Partial<User>[] = [
        { chatId: 1, currentPlanId: 'basic', accessExpiresAt: new Date('2025-01-01') },
        { chatId: 2, currentPlanId: 'pro', accessExpiresAt: new Date('2025-01-02') },
      ];
      mockUserService.findExpiredUsers.mockResolvedValue(expiredUsers as User[]);

      await taskService.handleExpiredSubscriptions();

      expect(userService.findExpiredUsers).toHaveBeenCalledTimes(1);
      expect(notificationService.removeUserFromGroup).toHaveBeenCalledTimes(2);
      expect(userService.save).toHaveBeenCalledTimes(2);

      expect(notificationService.removeUserFromGroup).toHaveBeenCalledWith('-1001234567890', 1);
      expect(notificationService.removeUserFromGroup).toHaveBeenCalledWith('-1001234567890', 2);

      expect(userService.save).toHaveBeenCalledWith(
        expect.objectContaining({
          chatId: 1,
          currentPlanId: null,
          accessExpiresAt: null,
        }),
      );
    });
  });
});