import { ApiResponseProperty } from '@nestjs/swagger';

import { LedgerEntryResponseDto } from './ledger-entry.response.dto';

export class LedgerEntryPageResponseDto {
  @ApiResponseProperty({ example: 1 })
  public page: number;

  @ApiResponseProperty({ example: 20 })
  public count: number;

  @ApiResponseProperty({ example: 3 })
  public pageCount: number;

  @ApiResponseProperty({ example: 42 })
  public total: number;

  @ApiResponseProperty({ type: [LedgerEntryResponseDto] })
  public data: LedgerEntryResponseDto[];
}
