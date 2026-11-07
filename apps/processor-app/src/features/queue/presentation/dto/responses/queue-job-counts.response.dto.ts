import { ApiResponseProperty } from '@nestjs/swagger';

export class QueueJobCountsResponseDto {
  @ApiResponseProperty({ example: 0 })
  public active: number;

  @ApiResponseProperty({ example: 0 })
  public completed: number;

  @ApiResponseProperty({ example: 2 })
  public failed: number;

  @ApiResponseProperty({ example: 0 })
  public delayed: number;

  @ApiResponseProperty({ example: 5 })
  public waiting: number;

  @ApiResponseProperty({ example: 0 })
  public paused: number | null;
}
