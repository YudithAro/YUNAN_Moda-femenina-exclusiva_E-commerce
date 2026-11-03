import { BadRequestException } from '@nestjs/common';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import type { AuthRequest } from './auth.types.js';

describe('Own profile synchronization', () => {
  const syncUser = vi.fn();
  const controller = new AuthController({ syncUser } as unknown as AuthService);
  const request = { headers: {}, user: { id: 'verified', email: 'own@example.com', name: 'Own', role: 'USER' } } as AuthRequest;

  beforeEach(() => vi.clearAllMocks());

  it('returns only the authenticated identity', () => {
    expect(controller.me(request)).toEqual(request.user);
  });

  it('ignores posted identity and role fields', () => {
    controller.syncUser(request, { id: 'victim', email: 'victim@example.com', role: 'ADMIN', name: ' Updated ' } as { name: string });
    expect(syncUser).toHaveBeenCalledWith(request.user, 'Updated');
  });

  it('rejects invalid profile names', () => {
    expect(() => controller.syncUser(request, { name: 123 })).toThrow(BadRequestException);
  });
});
