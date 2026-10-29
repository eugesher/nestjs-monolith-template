import { ApiResponseProperty } from '@nestjs/swagger';

import { LedgerEntryResponseDto } from './ledger-entry-response.dto';

export class LedgerEntryPageResponseDto {
  @ApiResponseProperty({ type: [LedgerEntryResponseDto] })
  public items: LedgerEntryResponseDto[];

  @ApiResponseProperty({ example: 137 })
  public total: number;

  @ApiResponseProperty({ example: 1 })
  public page: number;

  @ApiResponseProperty({ example: 20 })
  public size: number;
}
