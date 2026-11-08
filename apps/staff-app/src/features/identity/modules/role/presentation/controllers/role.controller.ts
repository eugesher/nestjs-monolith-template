import { Body, Controller, Get, Param, Put, UseFilters } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { RequiresPermission } from '@acme-libs/auth';
import { PermissionCodeEnum } from '@acme-libs/kernel';

import { RoleListUseCase, RoleUpdatePermissionsUseCase } from '../../application';
import { RoleIdParamDto, RoleResponseDto, RoleUpdatePermissionsRequestDto } from '../dto';
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
  public async handleList(): Promise<RoleResponseDto[]> {
    return await this.list.execute();
  }

  @Put(':roleId/permissions')
  @RequiresPermission(PermissionCodeEnum.IAM_ROLE_EDIT)
  @ApiOperation({ summary: 'Replace the permission set of a role' })
  @ApiOkResponse({ type: RoleResponseDto })
  public async handleUpdatePermissions(
    @Param() params: RoleIdParamDto,
    @Body() body: RoleUpdatePermissionsRequestDto,
  ): Promise<RoleResponseDto> {
    const { roleId } = params;
    const { permissionCodes } = body;

    return await this.updatePermissions.execute({ roleId, permissionCodes });
  }
}
