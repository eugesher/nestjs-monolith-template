import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class ProductUpdateRequestDto {
  @ApiPropertyOptional({ example: 'Renamed product' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  public name?: string;
}
