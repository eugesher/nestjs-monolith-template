import { ApiResponseProperty } from '@nestjs/swagger';

export class NoteResponseDto {
  @ApiResponseProperty({ example: '17' })
  public id: string;

  @ApiResponseProperty({ example: 'item' })
  public subjectType: string;

  @ApiResponseProperty({ example: '42' })
  public subjectId: string;

  @ApiResponseProperty({ example: 'Customer called about this; refunded manually.' })
  public body: string;

  @ApiResponseProperty({ example: '7d3f0e2a-5b1c-4c8e-9a4f-2b6d8e1f3a5c' })
  public authorId: string;

  @ApiResponseProperty({ example: false })
  public resolved: boolean;

  @ApiResponseProperty({ example: 1 })
  public version: number;

  @ApiResponseProperty({ example: '2026-01-01T00:00:00.000Z' })
  public createdAt: string;

  @ApiResponseProperty({ example: '2026-01-01T00:00:00.000Z' })
  public updatedAt: string;
}
