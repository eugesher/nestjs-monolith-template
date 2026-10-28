import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';

export class HealthDependencyResponseDto {
  @ApiResponseProperty({ example: 'ok' })
  public status: 'ok' | 'error';

  @ApiProperty({ required: false, example: 3 })
  public latencyMs?: number;
}
