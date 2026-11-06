import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive, Max } from 'class-validator';

export class ProductStockAddRequestDto {
  @ApiProperty({ example: 10, description: 'Units to add, from 1 to 100000' })
  @IsInt()
  @IsPositive()
  @Max(100_000)
  public quantity: number;
}
