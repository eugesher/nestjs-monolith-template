import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsPositive } from 'class-validator';

import { PaginationHelper } from '@acme-libs/toolkit';

export class PageQueryDto {
  @ApiPropertyOptional({ example: 1, description: `Capped at ${PaginationHelper.MAX_PAGE}` })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  public page?: number;

  @ApiPropertyOptional({ example: 20, description: `Capped at ${PaginationHelper.MAX_LIMIT}` })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  public limit?: number;
}
