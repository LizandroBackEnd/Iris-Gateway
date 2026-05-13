import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './application/auth.service';
import {
  EnvCredentialsVerifier,
  credentialsVerifierProvider,
} from './infrastructure/adapters/env-credentials.adapter';
import {
  InMemoryRefreshSessionStore,
  refreshSessionStoreProvider,
} from './infrastructure/adapters/in-memory-refresh-session.adapter';
import {
  JwtAuthTokenFactory,
  authTokenFactoryProvider,
} from './infrastructure/adapters/jwt-auth-token.factory';
import { AuthController } from './infrastructure/controllers/auth.controller';
import { JwtAuthGuard } from './infrastructure/guards/jwt-auth.guard';
import { JwtAccessStrategy } from './infrastructure/strategies/jwt-access.strategy';

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_ACCESS_SECRET'),
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    EnvCredentialsVerifier,
    credentialsVerifierProvider,
    InMemoryRefreshSessionStore,
    refreshSessionStoreProvider,
    JwtAuthTokenFactory,
    authTokenFactoryProvider,
    JwtAccessStrategy,
    JwtAuthGuard,
  ],
  exports: [AuthService, JwtModule, PassportModule, JwtAuthGuard],
})
export class AuthModule {}
