import type { AuthSubjectId } from '../auth.entity';

export const AUTH_TOKEN_FACTORY = Symbol('AUTH_TOKEN_FACTORY');

export interface AccessJwtPayload {
  sub: AuthSubjectId;
  username: string;
  /** Igual al `jti` del refresh; debe coincidir con la sesión activa en servidor. */
  sid: string;
  typ: 'access';
}

export interface RefreshJwtPayload {
  sub: AuthSubjectId;
  jti: string;
  username: string;
  typ: 'refresh';
}

export interface AuthTokenFactory {
  createAccessToken(username: string, sessionId: string): string;
  createRefreshToken(jti: string, username: string): string;
  parseRefreshToken(token: string): RefreshJwtPayload;
  /** Verifica firma y claims del access; usado p. ej. en logout sin refresh. */
  parseAccessToken(
    token: string,
  ): Pick<AccessJwtPayload, 'sid' | 'sub' | 'typ'>;
}
