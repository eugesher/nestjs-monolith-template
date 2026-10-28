import { ApiResponseProperty } from '@nestjs/swagger';

import { ReminderStatusEnum } from '@acme-libs/kernel';

export class ReminderResponseDto {
  @ApiResponseProperty({ example: '31' })
  public id: string;

  @ApiResponseProperty({ example: '7d3f0e2a-5b1c-4c8e-9a4f-2b6d8e1f3a5c' })
  public ownerId: string;

  @ApiResponseProperty({ example: 'Renew the subscription' })
  public title: string;

  @ApiResponseProperty({ example: 'The annual one, not the monthly add-on.' })
  public body: string;

  @ApiResponseProperty({ example: '2026-06-01' })
  public dueOn: string;

  @ApiResponseProperty({ enum: ReminderStatusEnum, example: ReminderStatusEnum.PENDING })
  public status: ReminderStatusEnum;

  @ApiResponseProperty({ example: 1 })
  public version: number;

  @ApiResponseProperty({ example: '2026-01-01T00:00:00.000Z' })
  public createdAt: string;

  @ApiResponseProperty({ example: '2026-01-01T00:00:00.000Z' })
  public updatedAt: string;
}
