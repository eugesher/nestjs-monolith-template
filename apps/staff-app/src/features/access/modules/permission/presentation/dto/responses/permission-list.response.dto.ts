import { ApiResponseProperty } from '@nestjs/swagger';

export class PermissionListResponseDto {
  @ApiResponseProperty({ example: ['ledger:read', 'product:read'] })
  public codes: string[];
}
