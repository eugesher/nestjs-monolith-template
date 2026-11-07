import { ApiResponseProperty } from '@nestjs/swagger';

class HealthDependenciesResponseDependenciesItemDto {
  @ApiResponseProperty({ example: 'ok' })
  public status: 'ok' | 'error';

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
  @ApiResponseProperty({ example: 'ready' })
  public status: 'ready' | 'not-ready';

  @ApiResponseProperty({ type: HealthDependenciesResponseDependenciesDto })
  public dependencies: HealthDependenciesResponseDependenciesDto;
}
