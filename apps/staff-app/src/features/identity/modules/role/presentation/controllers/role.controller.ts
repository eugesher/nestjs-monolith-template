import { Body, Controller, Get, Param, Put, UseFilters } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { RequiresPermission } from '@acme-libs/auth';
import { PermissionCodeEnum, RoleEnum } from '@acme-libs/kernel';
import { RoleListUseCase, RoleUpdatePermissionsUseCase } from '../../application';
import { RoleResponseDto } from '../dto/role-response.dto';
import { RoleUpdatePermissionsRequestDto } from '../dto/role-update-permissions-request.dto';
import { RoleHttpExceptionFilter } from '../filters/role-http-exception.filter';

@ApiTags('Identity/Role')
@UseFilters(RoleHttpExceptionFilter)
@Controller('identity/roles')
export class RoleController {
  constructor(
    private readonly list: RoleListUseCase,
    private readonly updatePermissions: RoleUpdatePermissionsUseCase,
  ) {}

  @Get()
  @RequiresPermission(PermissionCodeEnum.IAM_ASSIGN)
  @ApiOperation({ summary: 'List roles and the permissions they grant' })
  @ApiOkResponse({ type: RoleResponseDto, isArray: true })
  public handleList(): Promise<RoleResponseDto[]> {
    return this.list.execute();
  }

  @Put(':role/permissions')
  @RequiresPermission(PermissionCodeEnum.IAM_ROLE_EDIT)
  @ApiOperation({ summary: 'Replace the permission set of a role' })
  @ApiOkResponse({ type: RoleResponseDto })
  public handleUpdatePermissions(
    @Param('role') role: RoleEnum,
    @Body() body: RoleUpdatePermissionsRequestDto,
  ): Promise<RoleResponseDto> {
    const { permissionCodes } = body;

    return this.updatePermissions.execute({ role, permissionCodes });
  }
}
