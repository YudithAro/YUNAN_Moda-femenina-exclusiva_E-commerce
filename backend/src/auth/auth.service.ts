import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service.js';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async syncUser(data: { id: string, email: string, name: string }) {
    // Verificamos si el usuario ya existe
    let user = await this.usersService.findByEmail(data.email);
    if (!user) {
      // Si no existe, lo creamos con el id que nos manda Supabase
      user = await this.usersService.create({
        id: data.id,
        email: data.email,
        name: data.name || data.email.split('@')[0],
        role: 'USER'
      });
    } else if (user.id !== data.id) {
      // Si existe pero el ID es distinto (porque se migró a Supabase), actualizamos el ID local
      await this.usersService.updateId(user.id, data.id);
      user.id = data.id;
    }
    return { success: true, user };
  }
}
