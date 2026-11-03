import { BadRequestException, Body, Controller, Get, HttpCode, HttpStatus, Inject, Post, Req } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { Authenticated } from './access.decorator.js';
import type { AuthRequest } from './auth.types.js';

@Controller('auth')
@Authenticated()
export class AuthController {
  constructor(@Inject(AuthService) private readonly authService: AuthService) {}

  @Get('me')
  me(@Req() request: AuthRequest) {
    return request.user;
  }

  @Post('sync-user')
  @HttpCode(HttpStatus.OK)
  syncUser(@Req() request: AuthRequest, @Body() body: { name?: unknown } = {}) {
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw new BadRequestException('Perfil inválido.');
    if (body.name !== undefined && (typeof body.name !== 'string' || !body.name.trim() || body.name.length > 120)) {
      throw new BadRequestException('El nombre debe tener entre 1 y 120 caracteres.');
    }
    // Identity and role come from the verified session, never the body.
    return this.authService.syncUser(request.user, typeof body.name === 'string' ? body.name.trim() : undefined);
  }
}
