import { Inject, Controller, ForbiddenException, Get, Put } from '@nestjs/common';
import { UsersService } from './users.service.js';

@Controller('users')
export class UsersController {
  constructor(@Inject(UsersService) private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Put(':id/role')
  updateRole() {
    throw new ForbiddenException('Los roles se administran desde la base de datos.');
  }
}
