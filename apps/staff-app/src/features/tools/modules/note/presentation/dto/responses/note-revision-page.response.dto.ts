import { ApiResponseProperty } from '@nestjs/swagger';

import { NoteRevisionResponseDto } from './note-revision.response.dto';

export class NoteRevisionPageResponseDto {
  @ApiResponseProperty({ example: 1 })
  public page: number;

  @ApiResponseProperty({ example: 20 })
  public count: number;

  @ApiResponseProperty({ example: 3 })
  public pageCount: number;

  @ApiResponseProperty({ example: 42 })
  public total: number;

  @ApiResponseProperty({ type: [NoteRevisionResponseDto] })
  public data: NoteRevisionResponseDto[];
}
