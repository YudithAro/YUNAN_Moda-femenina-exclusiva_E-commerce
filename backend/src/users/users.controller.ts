import { Controller, Get, Put, Param, Body } from '@nestjs/common';
import { UsersService } from './users.service.js';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Put(':id/role')
  updateRole(@Param('id') id: string, @Body('role') role: string) {
    throw new Error('Cambio de roles deshabilitado por seguridad.');
  }
}
