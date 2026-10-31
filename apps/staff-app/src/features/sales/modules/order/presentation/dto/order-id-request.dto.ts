import { ApiProperty } from '@nestjs/swagger';
import { Matches } from 'class-validator';

export class OrderIdRequestDto {
  @ApiProperty({ example: '600', description: 'A positive integer of up to 20 digits' })
  @Matches(/^[1-9]\d{0,19}$/, { message: 'orderId must be a positive integer' })
  public orderId: string;
}
