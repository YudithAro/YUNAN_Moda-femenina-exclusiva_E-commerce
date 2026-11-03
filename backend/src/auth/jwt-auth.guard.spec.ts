import { ForbiddenException, UnauthorizedException, type ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import { AuthService } from './auth.service.js';

describe('API permissions', () => {
  const verifyToken = vi.fn();
  const getAllAndOverride = vi.fn();
  const guard = new JwtAuthGuard({ getAllAndOverride } as unknown as Reflector, { verifyToken } as unknown as AuthService);
  const request: { headers: { authorization?: string }; user?: unknown } = { headers: {} };
  const context = {
    getHandler: () => () => {}, getClass: () => class {}, switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;

  beforeEach(() => {
    vi.clearAllMocks();
    request.headers = {};
    delete request.user;
    getAllAndOverride.mockReturnValue(undefined);
  });

  it('keeps marked catalog reads public', async () => {
    getAllAndOverride.mockReturnValue('public');
    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(verifyToken).not.toHaveBeenCalled();
  });

  it('requires authentication by default', async () => {
    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('denies customer sessions access to administrative routes', async () => {
    request.headers.authorization = 'Bearer valid';
    verifyToken.mockResolvedValue({ id: 'customer', role: 'USER' });
    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('allows a verified admin', async () => {
    request.headers.authorization = 'Bearer valid';
    verifyToken.mockResolvedValue({ id: 'admin', role: 'ADMIN' });
    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(request.user).toEqual({ id: 'admin', role: 'ADMIN' });
  });

  it('allows customers to access their own profile', async () => {
    getAllAndOverride.mockReturnValue('authenticated');
    request.headers.authorization = 'Bearer valid';
    verifyToken.mockResolvedValue({ id: 'customer', role: 'USER' });
    await expect(guard.canActivate(context)).resolves.toBe(true);
  });
});
