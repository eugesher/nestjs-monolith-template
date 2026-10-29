import { ApiExtraModels, ApiProperty, ApiResponseProperty, getSchemaPath } from '@nestjs/swagger';

import { HealthDependencyResponseDto } from './health-dependency-response.dto';

@ApiExtraModels(HealthDependencyResponseDto)
export class HealthReadinessResponseDto {
  @ApiResponseProperty({ example: 'ready' })
  public status: 'ready' | 'not-ready';

  @ApiProperty({
    type: 'object',
    additionalProperties: { $ref: getSchemaPath(HealthDependencyResponseDto) },
  })
  public dependencies: Record<string, HealthDependencyResponseDto>;
}
