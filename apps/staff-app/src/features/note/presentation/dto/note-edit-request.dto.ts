import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class NoteEditRequestDto {
  @ApiProperty({ example: 'Customer called twice; refunded manually on the second call.' })
  @IsString()
  @MinLength(1)
  @MaxLength(4000)
  public body: string;
}
