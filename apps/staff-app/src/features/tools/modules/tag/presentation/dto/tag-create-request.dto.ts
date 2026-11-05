import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class TagCreateRequestDto {
  @ApiProperty({ example: 'fragile' })
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  public name: string;
}
