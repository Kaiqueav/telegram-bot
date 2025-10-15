import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from './admin.controller';
import { UserService } from '../user/user.service';
import { BuyerDto } from '../user/dto/buyer.dto';

describe('AdminController', () => {
  let adminController: AdminController;
  let userService: UserService;

  // Criamos um "mock" do UserService para simular o seu comportamento
  const mockUserService = {
    getBuyersForAdminPanel: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    adminController = module.get<AdminController>(AdminController);
    userService = module.get<UserService>(UserService);
  });

  it('deve ser definido', () => {
    expect(adminController).toBeDefined();
  });

  describe('getBuyers', () => {
    it('deve retornar um array de compradores do UserService', async () => {
      // Prepara os dados de retorno do nosso mock
      const mockBuyers: BuyerDto[] = [
        {
          chatId: 1,
          firstName: 'João',
          subscriptionStatus: 'active',
          daysRemaining: 10,
        },
        {
          chatId: 2,
          firstName: 'Maria',
          subscriptionStatus: 'expired',
          daysRemaining: 0,
        },
      ];
      mockUserService.getBuyersForAdminPanel.mockResolvedValue(mockBuyers);

      // Chama o método do controller
      const result = await adminController.getBuyer();

      // Verifica se o método do serviço foi chamado
      expect(userService.getBuyersForAdminPanel).toHaveBeenCalled();
      // Verifica se o resultado é o esperado
      expect(result).toEqual(mockBuyers);
      expect(result.length).toBe(2);
      expect(result[0].firstName).toBe('João');
    });
  });
});