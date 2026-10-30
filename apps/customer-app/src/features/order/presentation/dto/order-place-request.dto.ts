import { ApiProperty } from '@nestjs/swagger';
import { ArrayMaxSize, ArrayMinSize, IsArray, Matches } from 'class-validator';

export class OrderPlaceRequestDto {
  @ApiProperty({
    example: ['100', '100', '103'],
    description: 'One product id per unit: a repeated id orders one more unit, 1-100 units',
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @Matches(/^[1-9]\d{0,19}$/, { each: true, message: 'each productId must be a positive integer' })
  public productIds: string[];
}
