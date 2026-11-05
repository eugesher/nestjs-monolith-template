import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class TagRenameRequestDto {
  @ApiProperty({ example: 'handle-with-care' })
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  public name: string;
}
