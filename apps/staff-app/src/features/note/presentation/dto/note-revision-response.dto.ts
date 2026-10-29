import { ApiResponseProperty } from '@nestjs/swagger';

export class NoteRevisionResponseDto {
  @ApiResponseProperty({ example: '4210' })
  public id: string;

  @ApiResponseProperty({ example: '17' })
  public noteId: string;

  @ApiResponseProperty({ example: 2 })
  public noteVersion: number;

  @ApiResponseProperty({ example: 'Customer called about this; refunded manually.' })
  public bodyBefore: string;

  @ApiResponseProperty({ example: 'Customer called twice; refunded manually on the second call.' })
  public bodyAfter: string;

  @ApiResponseProperty({ example: '7d3f0e2a-5b1c-4c8e-9a4f-2b6d8e1f3a5c' })
  public editorId: string;

  @ApiResponseProperty({ example: 'b1e0c5d2-8f3a-4e6b-9c7d-1a2b3c4d5e6f' })
  public correlationId: string;

  @ApiResponseProperty({ example: '2026-01-01T00:00:00.120Z' })
  public recordedAt: string;
}
