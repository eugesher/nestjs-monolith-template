import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsPositive, Matches } from 'class-validator';

export class ProductGetManyQueryDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  public page?: number;

  @ApiPropertyOptional({ example: 20, description: 'Capped at 100' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  public limit?: number;

  @ApiPropertyOptional({ example: '300', description: 'Only the products with this tag' })
  @IsOptional()
  @Matches(/^[1-9]\d{0,19}$/, { message: 'tagId must be a positive integer' })
  public tagId?: string;
}
