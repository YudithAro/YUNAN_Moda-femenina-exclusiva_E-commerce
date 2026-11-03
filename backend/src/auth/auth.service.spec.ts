import { ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { UsersService } from '../users/users.service.js';

const { getUser } = vi.hoisted(() => ({ getUser: vi.fn() }));
vi.mock('@supabase/supabase-js', () => ({ createClient: () => ({ auth: { getUser } }) }));

describe('Verified Supabase identity', () => {
  const localUser = { id: 'verified-id', email: 'client@example.com', name: 'Client', role: 'USER' as const };
  const syncVerifiedUser = vi.fn().mockResolvedValue(localUser);
  let service: AuthService;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.SUPABASE_URL = 'https://project.supabase.co';
    process.env.SUPABASE_ANON_KEY = 'test-only';
    service = new AuthService({ syncVerifiedUser } as unknown as UsersService);
  });

  it('rejects invalid and expired tokens before accessing local data', async () => {
    getUser.mockResolvedValue({ data: { user: null }, error: new Error('expired') });
    await expect(service.verifyToken('invalid')).rejects.toBeInstanceOf(UnauthorizedException);
    expect(syncVerifiedUser).not.toHaveBeenCalled();
  });

  it('rejects unconfirmed or anonymous accounts', async () => {
    getUser.mockResolvedValue({ data: { user: { ...localUser, email_confirmed_at: null } }, error: null });
    await expect(service.verifyToken('token')).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('keeps a temporary Auth outage distinct from an invalid session', async () => {
    getUser.mockResolvedValue({ data: { user: null }, error: { name: 'AuthRetryableFetchError', status: 503 } });
    await expect(service.verifyToken('valid')).rejects.toBeInstanceOf(ServiceUnavailableException);
    expect(syncVerifiedUser).not.toHaveBeenCalled();
  });

  it('takes identity from Supabase and role from the local profile', async () => {
    getUser.mockResolvedValue({ data: { user: {
      ...localUser, email_confirmed_at: '2026-01-01', user_metadata: { name: 'Client', role: 'ADMIN' }, app_metadata: { role: 'ADMIN' },
    } }, error: null });
    await expect(service.verifyToken('valid')).resolves.toEqual(localUser);
    expect(getUser).toHaveBeenCalledWith('valid');
    expect(syncVerifiedUser).toHaveBeenCalledWith({ id: localUser.id, email: localUser.email, name: 'Client' });
  });
});
