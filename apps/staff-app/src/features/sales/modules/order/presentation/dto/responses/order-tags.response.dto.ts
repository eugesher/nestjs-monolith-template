import { ApiResponseProperty } from '@nestjs/swagger';

class OrderTagsResponseItemDto {
  @ApiResponseProperty({ example: '302' })
  public id: string;

  @ApiResponseProperty({ example: 'vip' })
  public name: string;
}

export class OrderTagsResponseDto {
  @ApiResponseProperty({ type: [OrderTagsResponseItemDto] })
  public tags: OrderTagsResponseItemDto[];
}
