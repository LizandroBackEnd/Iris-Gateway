import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../../application/auth.service';
import { LoginDto } from '../dto/login.dto';

function bearerToken(authorization?: string): string | undefined {
  if (!authorization) {
    return undefined;
  }
  const m = /^Bearer\s+(.+)$/i.exec(authorization.trim());
  return m?.[1];
}

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  login(@Body() body: LoginDto) {
    const tokens = this.auth.login(body.user, body.password);
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn,
      tokenType: 'Bearer' as const,
    };
  }

  @Post('refresh')
  refresh(@Headers('authorization') authorization?: string) {
    const token = bearerToken(authorization);
    if (!token) {
      throw new UnauthorizedException(
        'Se requiere cabecera Authorization: Bearer <refresh_token>',
      );
    }
    const tokens = this.auth.refresh(token);
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn,
      tokenType: 'Bearer' as const,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  logout(@Headers('authorization') authorization?: string) {
    const token = bearerToken(authorization);
    if (!token) {
      throw new BadRequestException(
        'Se requiere cabecera Authorization: Bearer <access_o_refresh_token>',
      );
    }
    this.auth.logoutWithBearer(token);
  }
}
