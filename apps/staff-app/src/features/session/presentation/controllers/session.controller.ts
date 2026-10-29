import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseFilters } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser, Public } from '@acme-libs/auth';
import type { IAuthCurrentUserView } from '@acme-libs/contracts/auth';
import { SessionLoginUseCase, SessionMeUseCase } from '../../application';
import { SessionAccessTokenResponseDto } from '../dto/session-access-token-response.dto';
import { SessionLoginRequestDto } from '../dto/session-login-request.dto';
import { SessionMeResponseDto } from '../dto/session-me-response.dto';
import { SessionHttpExceptionFilter } from '../filters/session-http-exception.filter';

@ApiTags('Session')
@UseFilters(SessionHttpExceptionFilter)
@Controller('auth')
export class SessionController {
  constructor(
    private readonly login: SessionLoginUseCase,
    private readonly me: SessionMeUseCase,
  ) {}

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Exchange staff credentials for an access token' })
  @ApiOkResponse({ type: SessionAccessTokenResponseDto })
  public handleLogin(@Body() body: SessionLoginRequestDto): Promise<SessionAccessTokenResponseDto> {
    return this.login.execute(body);
  }

  @Get('me')
  @ApiOperation({ summary: 'The authenticated staff user and the roles they hold' })
  @ApiOkResponse({ type: SessionMeResponseDto })
  public handleMe(@CurrentUser() user: IAuthCurrentUserView): Promise<SessionMeResponseDto> {
    const { id } = user;

    return this.me.execute({ userId: id });
  }
}
