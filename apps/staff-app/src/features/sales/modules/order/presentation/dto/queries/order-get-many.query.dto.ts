import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsPositive, Matches } from 'class-validator';

export class OrderGetManyQueryDto {
  @ApiPropertyOptional({ example: 1, description: 'Capped at 1000' })
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

  @ApiPropertyOptional({ example: '302', description: 'Only the orders with this tag' })
  @IsOptional()
  @Matches(/^[1-9]\d{0,19}$/, { message: 'tagId must be a positive integer' })
  public tagId?: string;
}
