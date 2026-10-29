import { ApiProperty } from '@nestjs/swagger';
import { Matches } from 'class-validator';

export class ItemIdRequestDto {
  @ApiProperty({ example: '12', description: 'A positive integer of up to 20 digits' })
  @Matches(/^[1-9]\d{0,19}$/, { message: 'itemId must be a positive integer' })
  public itemId: string;
}
