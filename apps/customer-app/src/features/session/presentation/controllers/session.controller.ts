import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseFilters } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser, Public } from '@acme-libs/auth';
import type { IAuthCurrentUserView } from '@acme-libs/contracts/auth';
import { SessionLoginUseCase, SessionRefreshUseCase } from '../../application';
import { SessionLoginRequestDto } from '../dto/session-login-request.dto';
import { SessionMeResponseDto } from '../dto/session-me-response.dto';
import { SessionRefreshRequestDto } from '../dto/session-refresh-request.dto';
import { SessionTokenPairResponseDto } from '../dto/session-token-pair-response.dto';
import { SessionHttpExceptionFilter } from '../filters/session-http-exception.filter';

@ApiTags('Session')
@UseFilters(SessionHttpExceptionFilter)
@Controller('auth')
export class SessionController {
  constructor(
    private readonly login: SessionLoginUseCase,
    private readonly refresh: SessionRefreshUseCase,
  ) {}

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Exchange credentials for an access/refresh pair' })
  @ApiOkResponse({ type: SessionTokenPairResponseDto })
  public handleLogin(@Body() body: SessionLoginRequestDto): Promise<SessionTokenPairResponseDto> {
    return this.login.execute(body);
  }

  @Post('refresh')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Exchange a refresh token for a fresh pair' })
  @ApiOkResponse({ type: SessionTokenPairResponseDto })
  public handleRefresh(
    @Body() body: SessionRefreshRequestDto,
  ): Promise<SessionTokenPairResponseDto> {
    return this.refresh.execute(body);
  }

  @Get('me')
  @ApiOperation({ summary: 'The authenticated subject, as the guards resolved it' })
  @ApiOkResponse({ type: SessionMeResponseDto })
  public handleMe(@CurrentUser() user: IAuthCurrentUserView): SessionMeResponseDto {
    const { id, email, roles, permissions } = user;

    return { id, email, roles, permissions };
  }
}
