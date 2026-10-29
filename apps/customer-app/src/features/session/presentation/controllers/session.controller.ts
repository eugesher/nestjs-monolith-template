import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseFilters } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser, Public } from '@acme-libs/auth';
import type { IAuthCurrentUserView } from '@acme-libs/contracts/auth';
import { SessionLoginUseCase, SessionRegisterUseCase } from '../../application';
import { SessionAccessTokenResponseDto } from '../dto/session-access-token-response.dto';
import { SessionLoginRequestDto } from '../dto/session-login-request.dto';
import { SessionMeResponseDto } from '../dto/session-me-response.dto';
import { SessionRegisterRequestDto } from '../dto/session-register-request.dto';
import { SessionRegisterResponseDto } from '../dto/session-register-response.dto';
import { SessionHttpExceptionFilter } from '../filters/session-http-exception.filter';

@ApiTags('Session')
@UseFilters(SessionHttpExceptionFilter)
@Controller('auth')
export class SessionController {
  constructor(
    private readonly register: SessionRegisterUseCase,
    private readonly login: SessionLoginUseCase,
  ) {}

  @Post('register')
  @Public()
  @ApiOperation({ summary: 'Sign up as a customer; log in afterwards for a token' })
  @ApiCreatedResponse({ type: SessionRegisterResponseDto })
  public handleRegister(
    @Body() body: SessionRegisterRequestDto,
  ): Promise<SessionRegisterResponseDto> {
    return this.register.execute(body);
  }

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Exchange credentials for an access token' })
  @ApiOkResponse({ type: SessionAccessTokenResponseDto })
  public handleLogin(@Body() body: SessionLoginRequestDto): Promise<SessionAccessTokenResponseDto> {
    return this.login.execute(body);
  }

  @Get('me')
  @ApiOperation({ summary: 'The authenticated customer, as the guards resolved them' })
  @ApiOkResponse({ type: SessionMeResponseDto })
  public handleMe(@CurrentUser() user: IAuthCurrentUserView): SessionMeResponseDto {
    const { id, email } = user;

    return { id, email };
  }
}
