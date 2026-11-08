import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';

import { HealthDependencyStatusEnum, HealthReadinessStatusEnum } from '@acme-libs/kernel';

class HealthReadinessResponseDependencyDto {
  @ApiResponseProperty({
    enum: HealthDependencyStatusEnum,
    example: HealthDependencyStatusEnum.OK,
  })
  public status: HealthDependencyStatusEnum;

  @ApiProperty({ readOnly: true, nullable: true, example: 3 })
  public latencyMs: number | null;
}

class HealthReadinessResponseDependenciesDto {
  @ApiResponseProperty({ type: HealthReadinessResponseDependencyDto })
  public database: HealthReadinessResponseDependencyDto;

  @ApiResponseProperty({ type: HealthReadinessResponseDependencyDto })
  public cache: HealthReadinessResponseDependencyDto;
}

export class HealthReadinessResponseDto {
  @ApiResponseProperty({
    enum: HealthReadinessStatusEnum,
    example: HealthReadinessStatusEnum.READY,
  })
  public status: HealthReadinessStatusEnum;

  @ApiResponseProperty({ example: 'customer-app' })
  public app: string;

  @ApiResponseProperty({ type: HealthReadinessResponseDependenciesDto })
  public dependencies: HealthReadinessResponseDependenciesDto;
}
