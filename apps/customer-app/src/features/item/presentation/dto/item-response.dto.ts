import { ApiResponseProperty } from '@nestjs/swagger';

import { ItemStatusEnum } from '@acme-libs/kernel';

export class ItemResponseDto {
  @ApiResponseProperty({ example: '12' })
  public id: string;

  @ApiResponseProperty({ example: 'SKU-0001' })
  public sku: string;

  @ApiResponseProperty({ example: 'Reference item' })
  public name: string;

  @ApiResponseProperty({ enum: ItemStatusEnum, example: ItemStatusEnum.ACTIVE })
  public status: ItemStatusEnum;

  @ApiResponseProperty({ example: 1 })
  public version: number;

  @ApiResponseProperty({ example: '2026-01-01T00:00:00.000Z' })
  public createdAt: string;

  @ApiResponseProperty({ example: '2026-01-01T00:00:00.000Z' })
  public updatedAt: string;
}
