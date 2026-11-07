import { ApiResponseProperty } from '@nestjs/swagger';

import { HealthDependencyStatusEnum, HealthReadinessStatusEnum } from '@acme-libs/kernel';

class HealthDependenciesResponseDependenciesItemDto {
  @ApiResponseProperty({
    enum: HealthDependencyStatusEnum,
    example: HealthDependencyStatusEnum.OK,
  })
  public status: HealthDependencyStatusEnum;

  @ApiResponseProperty({ example: 3 })
  public latencyMs: number | null;
}

class HealthDependenciesResponseDependenciesDto {
  @ApiResponseProperty({ type: HealthDependenciesResponseDependenciesItemDto })
  public database: HealthDependenciesResponseDependenciesItemDto;

  @ApiResponseProperty({ type: HealthDependenciesResponseDependenciesItemDto })
  public cache: HealthDependenciesResponseDependenciesItemDto;
}

export class HealthReadinessResponseDto {
  @ApiResponseProperty({
    enum: HealthReadinessStatusEnum,
    example: HealthReadinessStatusEnum.READY,
  })
  public status: HealthReadinessStatusEnum;

  @ApiResponseProperty({ example: 'processor-app' })
  public app: string;

  @ApiResponseProperty({ type: HealthDependenciesResponseDependenciesDto })
  public dependencies: HealthDependenciesResponseDependenciesDto;
}
