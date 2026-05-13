export const CREDENTIALS_VERIFIER = Symbol('CREDENTIALS_VERIFIER');

export interface CredentialsVerifier {
  verify(username: string, password: string): boolean;
}
