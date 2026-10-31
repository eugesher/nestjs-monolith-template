import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class ProductRenameRequestDto {
  @ApiProperty({ example: 'Renamed product' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  public name: string;
}
