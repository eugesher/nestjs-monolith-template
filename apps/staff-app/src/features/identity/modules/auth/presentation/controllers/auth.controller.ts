import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseFilters } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser, Public } from '@acme-libs/auth';
import type { IAuthCurrentUserView } from '@acme-libs/contracts/auth';
import { AuthLoginUseCase, AuthMeUseCase } from '../../application';
import { AuthAccessTokenResponseDto } from '../dto/auth-access-token-response.dto';
import { AuthLoginRequestDto } from '../dto/auth-login-request.dto';
import { AuthMeResponseDto } from '../dto/auth-me-response.dto';
import { AuthHttpExceptionFilter } from '../filters/auth-http-exception.filter';

@ApiTags('Identity/Auth')
@UseFilters(AuthHttpExceptionFilter)
@Controller('identity/auth')
export class AuthController {
  constructor(
    private readonly login: AuthLoginUseCase,
    private readonly me: AuthMeUseCase,
  ) {}

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Exchange staff credentials for an access token' })
  @ApiOkResponse({ type: AuthAccessTokenResponseDto })
  public handleLogin(@Body() body: AuthLoginRequestDto): Promise<AuthAccessTokenResponseDto> {
    return this.login.execute(body);
  }

  @Get('me')
  @ApiOperation({ summary: 'The authenticated staff user and the roles they hold' })
  @ApiOkResponse({ type: AuthMeResponseDto })
  public handleMe(@CurrentUser() user: IAuthCurrentUserView): Promise<AuthMeResponseDto> {
    const { id } = user;

    return this.me.execute({ userId: id });
  }
}
