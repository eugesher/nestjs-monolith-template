import { ApiResponseProperty } from '@nestjs/swagger';

export class HealthDependencyResponseDto {
  @ApiResponseProperty({ example: 'ok' })
  public status: 'ok' | 'error';

  @ApiResponseProperty({ example: 3 })
  public latencyMs: number | null;
}
