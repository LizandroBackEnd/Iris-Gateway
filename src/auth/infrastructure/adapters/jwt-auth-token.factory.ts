import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AUTH_SUBJECT_ID } from '../../domain/auth.entity';
import {
  AUTH_TOKEN_FACTORY,
  type AccessJwtPayload,
  type AuthTokenFactory,
  type RefreshJwtPayload,
} from '../../domain/ports/auth-token-factory.port';

@Injectable()
export class JwtAuthTokenFactory implements AuthTokenFactory {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  createAccessToken(username: string, sessionId: string): string {
    return this.jwt.sign({
      sub: AUTH_SUBJECT_ID,
      username,
      sid: sessionId,
      typ: 'access',
    });
  }

  createRefreshToken(jti: string, username: string): string {
    const secret = this.config.getOrThrow<string>('JWT_REFRESH_SECRET');
    return this.jwt.sign(
      { sub: AUTH_SUBJECT_ID, jti, username, typ: 'refresh' },
      { secret },
    );
  }

  parseRefreshToken(token: string): RefreshJwtPayload {
    const secret = this.config.getOrThrow<string>('JWT_REFRESH_SECRET');
    let payload: RefreshJwtPayload;
    try {
      payload = this.jwt.verify<RefreshJwtPayload>(token, {
        secret,
        ignoreExpiration: true,
      });
    } catch {
      throw new UnauthorizedException('Refresh token inválido');
    }
    if (
      payload.typ !== 'refresh' ||
      payload.sub !== AUTH_SUBJECT_ID ||
      typeof payload.jti !== 'string' ||
      typeof payload.username !== 'string'
    ) {
      throw new UnauthorizedException('Refresh token inválido');
    }
    return payload;
  }

  parseAccessToken(
    token: string,
  ): Pick<AccessJwtPayload, 'sid' | 'sub' | 'typ'> {
    let payload: AccessJwtPayload;
    try {
      payload = this.jwt.verify<AccessJwtPayload>(token, {
        ignoreExpiration: true,
      });
    } catch {
      throw new UnauthorizedException('Access token inválido');
    }
    if (
      payload.typ !== 'access' ||
      payload.sub !== AUTH_SUBJECT_ID ||
      typeof payload.sid !== 'string'
    ) {
      throw new UnauthorizedException('Access token inválido');
    }
    return { sid: payload.sid, sub: payload.sub, typ: payload.typ };
  }
}

export const authTokenFactoryProvider = {
  provide: AUTH_TOKEN_FACTORY,
  useExisting: JwtAuthTokenFactory,
};
