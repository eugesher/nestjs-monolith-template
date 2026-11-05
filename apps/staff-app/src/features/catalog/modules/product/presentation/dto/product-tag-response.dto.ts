import { ApiResponseProperty } from '@nestjs/swagger';

export class ProductTagResponseDto {
  @ApiResponseProperty({ example: '300' })
  public id: string;

  @ApiResponseProperty({ example: 'fragile' })
  public name: string;
}
