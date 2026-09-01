import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import 'dotenv/config';
import { passportJwtSecret } from 'jwks-rsa';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: process.env.SUPABASE_JWKS_URL || 'https://mmvgezwaijypyshwjjeo.supabase.co/auth/v1/.well-known/jwks.json',
      }),
      algorithms: ['RS256'],
    });
  }

  async validate(payload: any) {
    // Supabase JWT payload includes 'sub' as the user ID and 'email'.
    return { id: payload.sub, email: payload.email, role: payload.app_metadata?.role || 'USER' };
  }
}
