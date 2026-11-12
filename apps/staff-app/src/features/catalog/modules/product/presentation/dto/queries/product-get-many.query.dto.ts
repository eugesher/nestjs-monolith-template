import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, Matches } from 'class-validator';

import { PageQueryDto } from '@acme-libs/http';

export class ProductGetManyQueryDto extends PageQueryDto {
  @ApiPropertyOptional({ example: '300', description: 'Only the products with this tag' })
  @IsOptional()
  @Matches(/^[1-9]\d{0,19}$/, { message: 'tagId must be a positive integer' })
  public tagId?: string;
}
