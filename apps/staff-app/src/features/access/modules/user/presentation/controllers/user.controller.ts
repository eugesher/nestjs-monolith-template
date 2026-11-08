import { Body, Controller, Param, Post, Put, UseFilters } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { RequiresPermission } from '@acme-libs/auth';
import { PermissionCodeEnum } from '@acme-libs/kernel';

import { UserReassignRolesUseCase, UserRegisterUseCase } from '../../application';
import {
  UserRegisterRequestDto,
  UserResponseDto,
  UserRolesReassignRequestDto,
  UserRolesResponseDto,
} from '../dto';
import { UserHttpExceptionFilter } from '../filters/user-http-exception.filter';

@ApiTags('Access/User')
@UseFilters(UserHttpExceptionFilter)
@Controller('access/users')
export class UserController {
  constructor(
    private readonly register: UserRegisterUseCase,
    private readonly reassignRoles: UserReassignRolesUseCase,
  ) {}

  @Post()
  @RequiresPermission(PermissionCodeEnum.ACCESS_MANAGEMENT)
  @ApiOperation({ summary: 'Create a principal' })
  @ApiCreatedResponse({ type: UserResponseDto })
  public async handleRegister(@Body() body: UserRegisterRequestDto): Promise<UserResponseDto> {
    return await this.register.execute(body);
  }

  @Put(':userId/roles')
  @RequiresPermission(PermissionCodeEnum.ACCESS_MANAGEMENT)
  @ApiOperation({ summary: 'Reassign the roles of a principal' })
  @ApiOkResponse({ type: UserRolesResponseDto })
  public async handleReassignRoles(
    @Param('userId') userId: string,
    @Body() body: UserRolesReassignRequestDto,
  ): Promise<UserRolesResponseDto> {
    const { roleIds } = body;

    return await this.reassignRoles.execute({ userId, roleIds });
  }
}
