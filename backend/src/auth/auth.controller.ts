import { Controller, Post, Body, HttpCode, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sync-user')
  @HttpCode(HttpStatus.OK)
  async syncUser(@Body() body: { id: string, email: string, name: string }) {
    if (!body.id || !body.email) {
      throw new UnauthorizedException('Datos incompletos');
    }
    return this.authService.syncUser(body);
  }
}
