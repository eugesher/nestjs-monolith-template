import { ApiResponseProperty } from '@nestjs/swagger';

import { HealthLivenessStatusEnum } from '@acme-libs/kernel';

export class HealthLivenessResponseDto {
  @ApiResponseProperty({
    enum: HealthLivenessStatusEnum,
    example: HealthLivenessStatusEnum.OK,
  })
  public status: HealthLivenessStatusEnum;

  @ApiResponseProperty({ example: 'customer-app' })
  public app: string;

  @ApiResponseProperty({ example: 128 })
  public uptimeSeconds: number;
}
