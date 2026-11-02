import { ApiResponseProperty } from '@nestjs/swagger';

import { ReminderResponseDto } from './reminder-response.dto';

export class ReminderPageResponseDto {
  @ApiResponseProperty({ example: 1 })
  public page: number;

  @ApiResponseProperty({ example: 20 })
  public count: number;

  @ApiResponseProperty({ example: 3 })
  public pageCount: number;

  @ApiResponseProperty({ example: 42 })
  public total: number;

  @ApiResponseProperty({ type: [ReminderResponseDto] })
  public data: ReminderResponseDto[];
}
