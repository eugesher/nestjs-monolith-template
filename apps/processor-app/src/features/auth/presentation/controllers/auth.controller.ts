import { Body, Controller, HttpCode, HttpStatus, Post, UseFilters } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { Public } from '@acme-libs/auth';
import { AuthThrottle } from '@acme-libs/http';

import { AuthLoginUseCase } from '../../application';
import { AuthAccessTokenResponseDto, AuthLoginRequestDto } from '../dto';
import { AuthHttpExceptionFilter } from '../filters/auth-http-exception.filter';

@ApiTags('Auth')
@UseFilters(AuthHttpExceptionFilter)
@Controller('auth')
export class AuthController {
  constructor(private readonly login: AuthLoginUseCase) {}

  @Post('login')
  @Public()
  @AuthThrottle()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Exchange staff credentials for an access token' })
  @ApiOkResponse({ type: AuthAccessTokenResponseDto })
  public async handleLogin(@Body() body: AuthLoginRequestDto): Promise<AuthAccessTokenResponseDto> {
    return await this.login.execute(body);
  }
}
