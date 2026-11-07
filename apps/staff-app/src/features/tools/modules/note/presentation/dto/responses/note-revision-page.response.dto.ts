import { ApiResponseProperty } from '@nestjs/swagger';

class NoteRevisionPageResponseItemDto {
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

  @ApiResponseProperty({ example: '2' })
  public editorId: string;

  @ApiResponseProperty({ example: 'b1e0c5d2-8f3a-4e6b-9c7d-1a2b3c4d5e6f' })
  public correlationId: string;

  @ApiResponseProperty({ example: '2026-01-01T00:00:00.120Z' })
  public recordedAt: string;
}

export class NoteRevisionPageResponseDto {
  @ApiResponseProperty({ example: 1 })
  public page: number;

  @ApiResponseProperty({ example: 20 })
  public count: number;

  @ApiResponseProperty({ example: 3 })
  public pageCount: number;

  @ApiResponseProperty({ example: 42 })
  public total: number;

  @ApiResponseProperty({ type: [NoteRevisionPageResponseItemDto] })
  public data: NoteRevisionPageResponseItemDto[];
}
