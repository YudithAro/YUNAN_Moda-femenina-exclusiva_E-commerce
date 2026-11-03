import { ConflictException } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { pool } from '../database.js';

vi.mock('../database.js', () => ({ pool: { query: vi.fn() } }));

describe('Local profile roles', () => {
  const user = { id: 'trusted-id', email: 'client@example.com', name: 'Client' };

  it('preserves the existing role and never copies a supplied role', async () => {
    vi.mocked(pool.query).mockResolvedValueOnce({ rows: [{ ...user, role: 'ADMIN' }] } as never);
    const result = await new UsersService().syncVerifiedUser(user);
    const [sql, values] = vi.mocked(pool.query).mock.calls.at(-1)!;
    expect(sql).toContain("'USER'");
    expect(sql).not.toMatch(/role\s*=\s*EXCLUDED/i);
    expect(values).toEqual([user.id, user.name, user.email]);
    expect(result.role).toBe('ADMIN');
  });

  it('does not reassign an existing profile by matching its email', async () => {
    vi.mocked(pool.query).mockRejectedValueOnce({ code: '23505' });
    await expect(new UsersService().syncVerifiedUser(user)).rejects.toBeInstanceOf(ConflictException);
  });
});
