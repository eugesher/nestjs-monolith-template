import { ApiResponseProperty } from '@nestjs/swagger';

export class HealthLivenessResponseDto {
  @ApiResponseProperty({ example: 'ok' })
  public status: 'ok';

  @ApiResponseProperty({ example: 'admin-api' })
  public app: string;

  @ApiResponseProperty({ example: 128 })
  public uptimeSeconds: number;
}
