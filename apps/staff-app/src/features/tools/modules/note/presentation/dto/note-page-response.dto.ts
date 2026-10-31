import { ApiResponseProperty } from '@nestjs/swagger';

import { NoteResponseDto } from './note-response.dto';

export class NotePageResponseDto {
  @ApiResponseProperty({ type: [NoteResponseDto] })
  public items: NoteResponseDto[];

  @ApiResponseProperty({ example: 137 })
  public total: number;

  @ApiResponseProperty({ example: 1 })
  public page: number;

  @ApiResponseProperty({ example: 20 })
  public size: number;
}
