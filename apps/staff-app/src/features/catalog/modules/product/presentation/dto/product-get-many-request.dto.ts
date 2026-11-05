import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Matches, Min } from 'class-validator';

export class ProductGetManyRequestDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  public page?: number;

  @ApiPropertyOptional({ example: 20, description: 'Capped at 100' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  public limit?: number;

  @ApiPropertyOptional({ example: '300', description: 'Only the products with this tag' })
  @IsOptional()
  @Matches(/^[1-9]\d{0,19}$/, { message: 'tagId must be a positive integer' })
  public tagId?: string;
}
