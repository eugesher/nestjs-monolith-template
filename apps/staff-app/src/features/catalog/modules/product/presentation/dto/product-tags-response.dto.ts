import { ApiResponseProperty } from '@nestjs/swagger';

import { ProductTagResponseDto } from './product-tag-response.dto';

export class ProductTagsResponseDto {
  @ApiResponseProperty({ type: [ProductTagResponseDto] })
  public tags: ProductTagResponseDto[];
}
