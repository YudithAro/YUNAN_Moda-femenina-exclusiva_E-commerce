import { Controller, Post, Body, UnauthorizedException, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: Record<string, any>) {
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    return this.authService.login(user);
  }

  @Post('register')
  async register(@Body() body: Record<string, any>) {
    // Forzamos que el registro público siempre cree un usuario con rol 'USER', ignorando lo que venga del frontend.
    return this.authService.register({ ...body, role: 'USER' });
  }
}
