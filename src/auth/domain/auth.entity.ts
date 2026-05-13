/** Identificador estable del único operador del gateway (claim `sub`). */
export const AUTH_SUBJECT_ID = 'iris-admin' as const;

export type AuthSubjectId = typeof AUTH_SUBJECT_ID;

export interface AuthTokenPair {
  accessToken: string;
  refreshToken: string;
  /**
   * Sin caducidad por tiempo: la sesión solo termina con `logout` (o nuevo login).
   * Se expone `null` en la API en lugar de un TTL en segundos.
   */
  expiresIn: null;
}
