import { CanActivate, ExecutionContext, ForbiddenException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from './auth.service.js';
import { ACCESS } from './access.decorator.js';
import type { AuthRequest } from './auth.types.js';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(@Inject(Reflector) private readonly reflector: Reflector, @Inject(AuthService) private readonly auth: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const access = this.reflector.getAllAndOverride<string>(ACCESS, [context.getHandler(), context.getClass()]);
    if (access === 'public') return true;
    const request = context.switchToHttp().getRequest<AuthRequest>();
    const match = /^Bearer ([^\s]+)$/i.exec(request.headers.authorization || '');
    if (!match) throw new UnauthorizedException('Inicia sesión para continuar.');
    request.user = await this.auth.verifyToken(match[1]);
    if (access !== 'authenticated' && request.user.role !== 'ADMIN') {
      throw new ForbiddenException('Se requieren permisos de administrador.');
    }
    return true;
  }
}
