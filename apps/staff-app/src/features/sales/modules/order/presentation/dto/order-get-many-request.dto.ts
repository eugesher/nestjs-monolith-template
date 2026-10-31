import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class OrderGetManyRequestDto {
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
  public size?: number;
}
