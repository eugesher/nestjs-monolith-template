import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseFilters } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser, Public } from '@acme-libs/auth';
import type { IAuthCurrentUserView } from '@acme-libs/contracts/auth';
import { SessionLoginUseCase } from '../../application';
import { SessionAccessTokenResponseDto } from '../dto/session-access-token-response.dto';
import { SessionLoginRequestDto } from '../dto/session-login-request.dto';
import { SessionMeResponseDto } from '../dto/session-me-response.dto';
import { SessionHttpExceptionFilter } from '../filters/session-http-exception.filter';

@ApiTags('Session')
@UseFilters(SessionHttpExceptionFilter)
@Controller('auth')
export class SessionController {
  constructor(private readonly login: SessionLoginUseCase) {}

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Exchange credentials for an access token' })
  @ApiOkResponse({ type: SessionAccessTokenResponseDto })
  public handleLogin(@Body() body: SessionLoginRequestDto): Promise<SessionAccessTokenResponseDto> {
    return this.login.execute(body);
  }

  @Get('me')
  @ApiOperation({ summary: 'The authenticated subject, as the guards resolved it' })
  @ApiOkResponse({ type: SessionMeResponseDto })
  public handleMe(@CurrentUser() user: IAuthCurrentUserView): SessionMeResponseDto {
    const { id, email, roles, permissions } = user;

    return { id, email, roles, permissions };
  }
}
