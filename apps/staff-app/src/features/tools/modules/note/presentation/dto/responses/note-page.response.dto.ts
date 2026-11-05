import { ApiResponseProperty } from '@nestjs/swagger';

import { NoteResponseDto } from './note.response.dto';

export class NotePageResponseDto {
  @ApiResponseProperty({ example: 1 })
  public page: number;

  @ApiResponseProperty({ example: 20 })
  public count: number;

  @ApiResponseProperty({ example: 3 })
  public pageCount: number;

  @ApiResponseProperty({ example: 42 })
  public total: number;

  @ApiResponseProperty({ type: [NoteResponseDto] })
  public data: NoteResponseDto[];
}
