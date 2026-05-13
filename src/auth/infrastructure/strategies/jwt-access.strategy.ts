import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AUTH_SUBJECT_ID } from '../../domain/auth.entity';
import type { AccessJwtPayload } from '../../domain/ports/auth-token-factory.port';
import {
  REFRESH_SESSION_STORE,
  type RefreshSessionStore,
} from '../../domain/ports/refresh-session.port';

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    config: ConfigService,
    @Inject(REFRESH_SESSION_STORE)
    private readonly refreshSession: RefreshSessionStore,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: true,
      secretOrKey: config.getOrThrow<string>('JWT_ACCESS_SECRET'),
    });
  }

  validate(payload: AccessJwtPayload) {
    if (
      payload.typ !== 'access' ||
      payload.sub !== AUTH_SUBJECT_ID ||
      typeof payload.username !== 'string' ||
      typeof payload.sid !== 'string'
    ) {
      throw new UnauthorizedException();
    }
    const active = this.refreshSession.getActiveJti();
    if (!active || active !== payload.sid) {
      throw new UnauthorizedException();
    }
    return { sub: payload.sub, username: payload.username };
  }
}
