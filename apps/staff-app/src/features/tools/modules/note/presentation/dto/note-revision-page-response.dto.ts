import { ApiResponseProperty } from '@nestjs/swagger';

import { NoteRevisionResponseDto } from './note-revision-response.dto';

export class NoteRevisionPageResponseDto {
  @ApiResponseProperty({ type: [NoteRevisionResponseDto] })
  public items: NoteRevisionResponseDto[];

  @ApiResponseProperty({ example: 3 })
  public total: number;

  @ApiResponseProperty({ example: 1 })
  public page: number;

  @ApiResponseProperty({ example: 20 })
  public size: number;
}
