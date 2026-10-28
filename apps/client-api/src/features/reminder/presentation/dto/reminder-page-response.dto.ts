import { ApiResponseProperty } from '@nestjs/swagger';

import { ReminderResponseDto } from './reminder-response.dto';

export class ReminderPageResponseDto {
  @ApiResponseProperty({ type: [ReminderResponseDto] })
  public items: ReminderResponseDto[];

  @ApiResponseProperty({ example: 4 })
  public total: number;

  @ApiResponseProperty({ example: 1 })
  public page: number;

  @ApiResponseProperty({ example: 20 })
  public size: number;
}
