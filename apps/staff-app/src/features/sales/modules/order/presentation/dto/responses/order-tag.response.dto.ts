import { ApiResponseProperty } from '@nestjs/swagger';

export class OrderTagResponseDto {
  @ApiResponseProperty({ example: '302' })
  public id: string;

  @ApiResponseProperty({ example: 'vip' })
  public name: string;
}
