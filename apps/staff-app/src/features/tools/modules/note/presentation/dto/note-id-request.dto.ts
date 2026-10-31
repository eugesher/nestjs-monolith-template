import { ApiProperty } from '@nestjs/swagger';
import { Matches } from 'class-validator';

export class NoteIdRequestDto {
  @ApiProperty({ example: '17', description: 'A positive integer of up to 20 digits' })
  @Matches(/^[1-9]\d{0,19}$/, { message: 'noteId must be a positive integer' })
  public noteId: string;
}
