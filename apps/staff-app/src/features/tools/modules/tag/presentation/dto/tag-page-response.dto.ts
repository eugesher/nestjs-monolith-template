import { ApiResponseProperty } from '@nestjs/swagger';

import { TagResponseDto } from './tag-response.dto';

export class TagPageResponseDto {
  @ApiResponseProperty({ example: 1 })
  public page: number;

  @ApiResponseProperty({ example: 20 })
  public count: number;

  @ApiResponseProperty({ example: 3 })
  public pageCount: number;

  @ApiResponseProperty({ example: 42 })
  public total: number;

  @ApiResponseProperty({ type: [TagResponseDto] })
  public data: TagResponseDto[];
}
