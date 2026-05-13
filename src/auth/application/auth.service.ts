import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type { AuthTokenPair } from '../domain/auth.entity';
import {
  AUTH_TOKEN_FACTORY,
  type AuthTokenFactory,
} from '../domain/ports/auth-token-factory.port';
import {
  CREDENTIALS_VERIFIER,
  type CredentialsVerifier,
} from '../domain/ports/credentials-verifier.port';
import {
  REFRESH_SESSION_STORE,
  type RefreshSessionStore,
} from '../domain/ports/refresh-session.port';

@Injectable()
export class AuthService {
  constructor(
    @Inject(CREDENTIALS_VERIFIER)
    private readonly credentialsVerifier: CredentialsVerifier,
    @Inject(REFRESH_SESSION_STORE)
    private readonly refreshSession: RefreshSessionStore,
    @Inject(AUTH_TOKEN_FACTORY)
    private readonly tokens: AuthTokenFactory,
  ) {}

  login(user: string, password: string): AuthTokenPair {
    if (!this.credentialsVerifier.verify(user, password)) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }
    const jti = randomUUID();
    this.refreshSession.setActiveJti(jti);
    return this.buildTokenPair(user, jti);
  }

  refresh(refreshToken: string): AuthTokenPair {
    const { jti, username } = this.tokens.parseRefreshToken(refreshToken);
    const active = this.refreshSession.getActiveJti();
    if (!active || active !== jti) {
      throw new UnauthorizedException('Sesión de refresh inválida o cerrada');
    }
    const newJti = randomUUID();
    this.refreshSession.setActiveJti(newJti);
    return this.buildTokenPair(username, newJti);
  }

  /**
   * Cierra la sesión solo si el Bearer corresponde a la sesión activa.
   * Refresh u access obsoleto (p. ej. tras un `/auth/refresh`) → 401.
   */
  logoutWithBearer(bearerToken: string): void {
    const token = bearerToken.trim();

    let refreshPayload: { jti: string } | null = null;
    try {
      refreshPayload = this.tokens.parseRefreshToken(token);
    } catch {
      refreshPayload = null;
    }

    if (refreshPayload !== null) {
      const active = this.refreshSession.getActiveJti();
      if (active === refreshPayload.jti) {
        this.refreshSession.setActiveJti(null);
        return;
      }
      throw new UnauthorizedException(
        active === null
          ? 'Sesión ya cerrada o token no válido para logout'
          : 'Token obsoleto: la sesión fue renovada o reemplazada',
      );
    }

    let sid: string;
    try {
      sid = this.tokens.parseAccessToken(token).sid;
    } catch {
      throw new UnauthorizedException('Token inválido');
    }

    const active = this.refreshSession.getActiveJti();
    if (active === sid) {
      this.refreshSession.setActiveJti(null);
      return;
    }
    throw new UnauthorizedException(
      active === null
        ? 'Sesión ya cerrada o token no válido para logout'
        : 'Token obsoleto: la sesión fue renovada o reemplazada',
    );
  }

  private buildTokenPair(username: string, jti: string): AuthTokenPair {
    const accessToken = this.tokens.createAccessToken(username, jti);
    const refreshToken = this.tokens.createRefreshToken(jti, username);
    return { accessToken, refreshToken, expiresIn: null };
  }
}
