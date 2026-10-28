import { ApiResponseProperty } from '@nestjs/swagger';

import { ItemResponseDto } from './item-response.dto';

export class ItemPageResponseDto {
  @ApiResponseProperty({ type: [ItemResponseDto] })
  public items: ItemResponseDto[];

  @ApiResponseProperty({ example: 42 })
  public total: number;

  @ApiResponseProperty({ example: 1 })
  public page: number;

  @ApiResponseProperty({ example: 20 })
  public size: number;
}
