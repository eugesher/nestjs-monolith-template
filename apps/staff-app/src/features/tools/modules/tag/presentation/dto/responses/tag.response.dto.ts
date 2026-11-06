import { ApiResponseProperty } from '@nestjs/swagger';

export class TagResponseDto {
  @ApiResponseProperty({ example: '300' })
  public id: string;

  @ApiResponseProperty({ example: 'fragile' })
  public name: string;

  @ApiResponseProperty({ example: '2026-01-01T00:00:00.000Z' })
  public createdAt: string;

  @ApiResponseProperty({ example: '2026-01-01T00:00:00.000Z' })
  public updatedAt: string;
}
