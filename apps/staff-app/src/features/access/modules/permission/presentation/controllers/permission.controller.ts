import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { RequiresPermission } from '@acme-libs/auth';
import { PermissionCodeEnum } from '@acme-libs/kernel';

import { PermissionListUseCase } from '../../application';
import { PermissionListResponseDto } from '../dto';

@ApiTags('Access/Permission')
@Controller('access/permissions')
export class PermissionController {
  constructor(private readonly list: PermissionListUseCase) {}

  @Get()
  @RequiresPermission(PermissionCodeEnum.ACCESS_MANAGEMENT)
  @ApiOperation({ summary: 'List every permission code' })
  @ApiOkResponse({ type: PermissionListResponseDto })
  public handleList(): PermissionListResponseDto {
    return this.list.execute();
  }
}
