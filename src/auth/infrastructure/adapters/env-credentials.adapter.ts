import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { timingSafeEqual } from 'crypto';
import {
  CREDENTIALS_VERIFIER,
  type CredentialsVerifier,
} from '../../domain/ports/credentials-verifier.port';

@Injectable()
export class EnvCredentialsVerifier implements CredentialsVerifier {
  constructor(private readonly config: ConfigService) {}

  verify(username: string, password: string): boolean {
    const expectedUser = this.config.get<string>('ADMIN_USERNAME', '');
    const expectedPass = this.config.get<string>('ADMIN_PASSWORD', '');
    return (
      this.safeEqual(username, expectedUser) &&
      this.safeEqual(password, expectedPass)
    );
  }

  private safeEqual(a: string, b: string): boolean {
    const bufA = Buffer.from(a, 'utf8');
    const bufB = Buffer.from(b, 'utf8');
    if (bufA.length !== bufB.length) {
      return false;
    }
    return timingSafeEqual(bufA, bufB);
  }
}

export const credentialsVerifierProvider = {
  provide: CREDENTIALS_VERIFIER,
  useExisting: EnvCredentialsVerifier,
};
