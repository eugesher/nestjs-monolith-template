import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class ItemRenameRequestDto {
  @ApiProperty({ example: 'Renamed item' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  public name: string;
}
