import { Body, Controller, Get, Param, Post, Put, UseFilters } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { RequiresPermission } from '@acme-libs/auth';
import { PermissionCodeEnum } from '@acme-libs/kernel';

import {
  RoleCreateUseCase,
  RoleListUseCase,
  RoleReassignPermissionsUseCase,
} from '../../application';
import {
  RoleCreateRequestDto,
  RoleIdParamDto,
  RolePermissionsReassignRequestDto,
  RoleResponseDto,
} from '../dto';
import { RoleHttpExceptionFilter } from '../filters/role-http-exception.filter';

@ApiTags('Identity/Role')
@UseFilters(RoleHttpExceptionFilter)
@Controller('identity/roles')
export class RoleController {
  constructor(
    private readonly list: RoleListUseCase,
    private readonly create: RoleCreateUseCase,
    private readonly reassignPermissions: RoleReassignPermissionsUseCase,
  ) {}

  @Get()
  @RequiresPermission(PermissionCodeEnum.IDENTITY_ROLE_ASSIGN)
  @ApiOperation({ summary: 'List roles and the permissions they grant' })
  @ApiOkResponse({ type: RoleResponseDto, isArray: true })
  public async handleList(): Promise<RoleResponseDto[]> {
    return await this.list.execute();
  }

  @Post()
  @RequiresPermission(PermissionCodeEnum.IDENTITY_PERMISSION_ASSIGN)
  @ApiOperation({ summary: 'Create a role with its permissions' })
  @ApiCreatedResponse({ type: RoleResponseDto })
  public async handleCreate(@Body() body: RoleCreateRequestDto): Promise<RoleResponseDto> {
    const { name, permissionCodes } = body;

    return await this.create.execute({ name, permissionCodes });
  }

  @Put(':roleId/permissions')
  @RequiresPermission(PermissionCodeEnum.IDENTITY_PERMISSION_ASSIGN)
  @ApiOperation({ summary: 'Reassign the permission set of a role' })
  @ApiOkResponse({ type: RoleResponseDto })
  public async handleReassignPermissions(
    @Param() params: RoleIdParamDto,
    @Body() body: RolePermissionsReassignRequestDto,
  ): Promise<RoleResponseDto> {
    const { roleId } = params;
    const { permissionCodes } = body;

    return await this.reassignPermissions.execute({ roleId, permissionCodes });
  }
}
