import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';

import { BuyerDto } from 'src/user/dto/buyer.dto';
import { UserService } from 'src/user/user.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly userService: UserService) {}

 

  @Get('buyers')
  async getBuyer(): Promise<BuyerDto[]> {
    return this.userService.getBuyersForAdminPanel();
  }



  
}
