import { Inject, Injectable, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { UsersService } from '../users/users.service.js';
import type { AuthUser } from './auth.types.js';

@Injectable()
export class AuthService {
  private client?: SupabaseClient;
  constructor(@Inject(UsersService) private readonly usersService: UsersService) {}

  private getClient() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new ServiceUnavailableException('El servicio de autenticación no está configurado.');
    this.client ??= createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
    return this.client;
  }

  async verifyToken(token: string): Promise<AuthUser> {
    // Verify against this project's Auth server, including the current signing key.
    const { data, error } = await this.getClient().auth.getUser(token);
    if (error && (error.name === 'AuthRetryableFetchError' || (error.status !== undefined && error.status >= 500))) {
      throw new ServiceUnavailableException('No se pudo verificar la sesión. Inténtalo nuevamente.');
    }
    if (error || !data.user || !data.user.email || !data.user.email_confirmed_at || data.user.is_anonymous) {
      throw new UnauthorizedException('La sesión no es válida. Vuelve a iniciar sesión.');
    }
    const user = data.user;
    return this.usersService.syncVerifiedUser({
      id: user.id,
      email: user.email!,
      name: typeof user.user_metadata?.name === 'string' ? user.user_metadata.name : user.email!.split('@')[0],
    });
  }

  async syncUser(user: AuthUser, name?: string) {
    const synced = await this.usersService.syncVerifiedUser({ ...user, name: name ?? user.name });
    return { success: true, user: synced };
  }
}
