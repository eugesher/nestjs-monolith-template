import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { RequiresPermission } from '@acme-libs/auth';
import { PermissionCodeEnum } from '@acme-libs/kernel';

import { LedgerListEntriesUseCase } from '../../application';
import { LedgerEntryPageResponseDto, LedgerListEntriesQueryDto } from '../dto';

@ApiTags('Ledger')
@Controller('ledger')
export class LedgerController {
  constructor(private readonly listEntries: LedgerListEntriesUseCase) {}

  @Get()
  @RequiresPermission(PermissionCodeEnum.LEDGER_READ)
  @ApiOperation({ summary: 'Browse the append-only ledger, newest first' })
  @ApiOkResponse({ type: LedgerEntryPageResponseDto })
  public async handleList(
    @Query() query: LedgerListEntriesQueryDto,
  ): Promise<LedgerEntryPageResponseDto> {
    return await this.listEntries.execute(query);
  }
}
