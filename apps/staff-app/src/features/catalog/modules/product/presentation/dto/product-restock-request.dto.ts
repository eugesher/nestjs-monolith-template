import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Max, Min } from 'class-validator';

export class ProductRestockRequestDto {
  @ApiProperty({ example: 10, description: 'Units to add, from 1 to 100000' })
  @IsInt()
  @Min(1)
  @Max(100_000)
  public quantity: number;
}
