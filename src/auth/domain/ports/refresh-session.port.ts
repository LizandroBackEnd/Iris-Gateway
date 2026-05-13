export const REFRESH_SESSION_STORE = Symbol('REFRESH_SESSION_STORE');

/**
 * Puerto de persistencia de la sesión de refresh (un solo jti activo).
 * Implementación típica en memoria para un único usuario / instancia.
 */
export interface RefreshSessionStore {
  getActiveJti(): string | null;
  setActiveJti(jti: string | null): void;
}
