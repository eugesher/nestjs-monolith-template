import { Body, Controller, HttpCode, HttpStatus, Param, Post, UseFilters } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { RequiresPermission } from '@acme-libs/auth';
import { PermissionCodeEnum } from '@acme-libs/kernel';
import { UserAssignRoleUseCase, UserRegisterUseCase } from '../../application';
import { UserAssignRoleRequestDto } from '../dto/user-assign-role-request.dto';
import { UserRegisterRequestDto } from '../dto/user-register-request.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import { UserRolesResponseDto } from '../dto/user-roles-response.dto';
import { UserHttpExceptionFilter } from '../filters/user-http-exception.filter';

@ApiTags('Identity/User')
@UseFilters(UserHttpExceptionFilter)
@Controller('identity/users')
export class UserController {
  constructor(
    private readonly register: UserRegisterUseCase,
    private readonly assignRole: UserAssignRoleUseCase,
  ) {}

  @Post()
  @RequiresPermission(PermissionCodeEnum.IAM_USER_CREATE)
  @ApiOperation({ summary: 'Create a principal' })
  @ApiCreatedResponse({ type: UserResponseDto })
  public handleRegister(@Body() body: UserRegisterRequestDto): Promise<UserResponseDto> {
    return this.register.execute(body);
  }

  @Post(':userId/roles')
  @RequiresPermission(PermissionCodeEnum.IAM_ASSIGN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Grant a role to a principal' })
  @ApiOkResponse({ type: UserRolesResponseDto })
  public handleAssignRole(
    @Param('userId') userId: string,
    @Body() body: UserAssignRoleRequestDto,
  ): Promise<UserRolesResponseDto> {
    const { role } = body;

    return this.assignRole.execute({ userId, role });
  }
}
