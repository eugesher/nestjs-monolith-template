import { ApiProperty } from '@nestjs/swagger';
import { Matches } from 'class-validator';

export class TagIdRequestDto {
  @ApiProperty({ example: '300', description: 'A positive integer of up to 20 digits' })
  @Matches(/^[1-9]\d{0,19}$/, { message: 'tagId must be a positive integer' })
  public tagId: string;
}
