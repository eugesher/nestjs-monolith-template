import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, Matches } from 'class-validator';

import { PageQueryDto } from '@acme-libs/http';

export class OrderGetManyQueryDto extends PageQueryDto {
  @ApiPropertyOptional({ example: '302', description: 'Only the orders with this tag' })
  @IsOptional()
  @Matches(/^[1-9]\d{0,19}$/, { message: 'tagId must be a positive integer' })
  public tagId?: string;
}
