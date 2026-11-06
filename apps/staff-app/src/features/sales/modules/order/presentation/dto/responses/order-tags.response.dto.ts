import { ApiResponseProperty } from '@nestjs/swagger';

import { OrderTagResponseDto } from './order-tag.response.dto';

export class OrderTagsResponseDto {
  @ApiResponseProperty({ type: [OrderTagResponseDto] })
  public tags: OrderTagResponseDto[];
}
