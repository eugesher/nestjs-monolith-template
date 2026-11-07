import { ApiResponseProperty } from '@nestjs/swagger';

import { HealthDependencyResponseDto } from './health-dependency.response.dto';

export class HealthDependenciesResponseDto {
  @ApiResponseProperty({ type: HealthDependencyResponseDto })
  public database: HealthDependencyResponseDto;

  @ApiResponseProperty({ type: HealthDependencyResponseDto })
  public cache: HealthDependencyResponseDto;
}
