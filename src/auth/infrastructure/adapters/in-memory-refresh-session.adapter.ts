import { Injectable } from '@nestjs/common';
import {
  REFRESH_SESSION_STORE,
  type RefreshSessionStore,
} from '../../domain/ports/refresh-session.port';

@Injectable()
export class InMemoryRefreshSessionStore implements RefreshSessionStore {
  private activeJti: string | null = null;

  getActiveJti(): string | null {
    return this.activeJti;
  }

  setActiveJti(jti: string | null): void {
    this.activeJti = jti;
  }
}

export const refreshSessionStoreProvider = {
  provide: REFRESH_SESSION_STORE,
  useExisting: InMemoryRefreshSessionStore,
};
