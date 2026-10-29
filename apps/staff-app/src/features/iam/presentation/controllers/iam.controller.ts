import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UseFilters,
} from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { RequiresPermission } from '@acme-libs/auth';
import { PermissionCodeEnum, RoleEnum } from '@acme-libs/kernel';
import {
  IamAssignRoleUseCase,
  IamListRolesUseCase,
  IamRegisterUserUseCase,
  IamUpdateRolePermissionsUseCase,
} from '../../application';
import { IamAssignRoleRequestDto } from '../dto/iam-assign-role-request.dto';
import { IamRegisterUserRequestDto } from '../dto/iam-register-user-request.dto';
import { IamRoleResponseDto } from '../dto/iam-role-response.dto';
import { IamUpdateRolePermissionsRequestDto } from '../dto/iam-update-role-permissions-request.dto';
import { IamUserResponseDto } from '../dto/iam-user-response.dto';
import { IamUserRolesResponseDto } from '../dto/iam-user-roles-response.dto';
import { IamHttpExceptionFilter } from '../filters/iam-http-exception.filter';

@ApiTags('IAM')
@UseFilters(IamHttpExceptionFilter)
@Controller('iam')
export class IamController {
  constructor(
    private readonly registerUser: IamRegisterUserUseCase,
    private readonly assignRole: IamAssignRoleUseCase,
    private readonly listRoles: IamListRolesUseCase,
    private readonly updateRolePermissions: IamUpdateRolePermissionsUseCase,
  ) {}

  @Post('users')
  @RequiresPermission(PermissionCodeEnum.IAM_USER_CREATE)
  @ApiOperation({ summary: 'Create a principal' })
  @ApiCreatedResponse({ type: IamUserResponseDto })
  public handleRegisterUser(@Body() body: IamRegisterUserRequestDto): Promise<IamUserResponseDto> {
    return this.registerUser.execute(body);
  }

  @Post('users/:userId/roles')
  @RequiresPermission(PermissionCodeEnum.IAM_ASSIGN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Grant a role to a principal' })
  @ApiOkResponse({ type: IamUserRolesResponseDto })
  public handleAssignRole(
    @Param('userId') userId: string,
    @Body() body: IamAssignRoleRequestDto,
  ): Promise<IamUserRolesResponseDto> {
    const { role } = body;

    return this.assignRole.execute({ userId, role });
  }

  @Get('roles')
  @RequiresPermission(PermissionCodeEnum.IAM_ASSIGN)
  @ApiOperation({ summary: 'List roles and the permissions they grant' })
  @ApiOkResponse({ type: IamRoleResponseDto, isArray: true })
  public handleListRoles(): Promise<IamRoleResponseDto[]> {
    return this.listRoles.execute();
  }

  @Put('roles/:role/permissions')
  @RequiresPermission(PermissionCodeEnum.IAM_ROLE_EDIT)
  @ApiOperation({ summary: 'Replace the permission set of a role' })
  @ApiOkResponse({ type: IamRoleResponseDto })
  public handleUpdateRolePermissions(
    @Param('role') role: RoleEnum,
    @Body() body: IamUpdateRolePermissionsRequestDto,
  ): Promise<IamRoleResponseDto> {
    const { permissionCodes } = body;

    return this.updateRolePermissions.execute({ role, permissionCodes });
  }
}
