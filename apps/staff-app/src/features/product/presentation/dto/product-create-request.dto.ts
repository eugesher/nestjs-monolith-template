import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class ProductCreateRequestDto {
  @ApiProperty({
    example: 'SKU-0001',
    description: 'Uppercase letters, digits and dashes, 3-64 chars',
  })
  @IsString()
  @Matches(/^[A-Z0-9][A-Z0-9-]{2,63}$/, {
    message: 'sku must be uppercase alphanumeric with dashes, 3-64 chars',
  })
  public sku: string;

  @ApiProperty({ example: 'Reference product' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  public name: string;
}
