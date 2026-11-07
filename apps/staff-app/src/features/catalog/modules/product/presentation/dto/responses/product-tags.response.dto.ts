import { ApiResponseProperty } from '@nestjs/swagger';

class ProductTagsResponseItemDto {
  @ApiResponseProperty({ example: '300' })
  public id: string;

  @ApiResponseProperty({ example: 'fragile' })
  public name: string;
}

export class ProductTagsResponseDto {
  @ApiResponseProperty({ type: [ProductTagsResponseItemDto] })
  public tags: ProductTagsResponseItemDto[];
}
