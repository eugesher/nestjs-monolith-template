import { ApiResponseProperty } from '@nestjs/swagger';

export class OrderSummaryResponseDto {
  @ApiResponseProperty({ example: '600' })
  public id: string;

  @ApiResponseProperty({ example: '2026-01-01T00:00:00.000Z' })
  public createdAt: string;
}
