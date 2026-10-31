import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseFilters } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser, Public } from '@acme-libs/auth';
import type { IAuthCurrentUserView } from '@acme-libs/contracts/auth';
import { AuthLoginUseCase, AuthRegisterUseCase } from '../../application';
import { AuthAccessTokenResponseDto } from '../dto/auth-access-token-response.dto';
import { AuthLoginRequestDto } from '../dto/auth-login-request.dto';
import { AuthMeResponseDto } from '../dto/auth-me-response.dto';
import { AuthRegisterRequestDto } from '../dto/auth-register-request.dto';
import { AuthRegisterResponseDto } from '../dto/auth-register-response.dto';
import { AuthHttpExceptionFilter } from '../filters/auth-http-exception.filter';

@ApiTags('Auth')
@UseFilters(AuthHttpExceptionFilter)
@Controller('auth')
export class AuthController {
  constructor(
    private readonly register: AuthRegisterUseCase,
    private readonly login: AuthLoginUseCase,
  ) {}

  @Post('register')
  @Public()
  @ApiOperation({ summary: 'Sign up as a customer; log in afterwards for a token' })
  @ApiCreatedResponse({ type: AuthRegisterResponseDto })
  public async handleRegister(
    @Body() body: AuthRegisterRequestDto,
  ): Promise<AuthRegisterResponseDto> {
    return await this.register.execute(body);
  }

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Exchange credentials for an access token' })
  @ApiOkResponse({ type: AuthAccessTokenResponseDto })
  public async handleLogin(@Body() body: AuthLoginRequestDto): Promise<AuthAccessTokenResponseDto> {
    return await this.login.execute(body);
  }

  @Get('me')
  @ApiOperation({ summary: 'The authenticated customer, as the guards resolved them' })
  @ApiOkResponse({ type: AuthMeResponseDto })
  public handleMe(@CurrentUser() user: IAuthCurrentUserView): AuthMeResponseDto {
    const { id, email } = user;

    return { id, email };
  }
}
