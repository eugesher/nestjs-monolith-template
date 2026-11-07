import { ApiResponseProperty } from '@nestjs/swagger';

import { HealthDependenciesResponseDto } from './health-dependencies.response.dto';

export class HealthReadinessResponseDto {
  @ApiResponseProperty({ example: 'ready' })
  public status: 'ready' | 'not-ready';

  @ApiResponseProperty({ type: HealthDependenciesResponseDto })
  public dependencies: HealthDependenciesResponseDto;
}
