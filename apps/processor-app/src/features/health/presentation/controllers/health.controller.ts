import { Controller, Get, HttpStatus, Inject, Res } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiTags,
} from '@nestjs/swagger';

import { HEALTH_LIB_PORT, type IHealthLibPort } from '@acme-libs/contracts/health';
import { HealthLivenessResponseDto } from '../dto/health-liveness-response.dto';
import { HealthReadinessResponseDto } from '../dto/health-readiness-response.dto';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    @Inject(HEALTH_LIB_PORT)
    private readonly health: IHealthLibPort,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Liveness: is the process running?' })
  @ApiOkResponse({ type: HealthLivenessResponseDto })
  public live(): HealthLivenessResponseDto {
    return this.health.liveness();
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness: can the process serve traffic right now?' })
  @ApiOkResponse({ type: HealthReadinessResponseDto })
  @ApiServiceUnavailableResponse({ type: HealthReadinessResponseDto })
  public async ready(
    @Res({ passthrough: true }) response: { status(code: HttpStatus): unknown },
  ): Promise<HealthReadinessResponseDto> {
    const view = await this.health.readiness();
    const status = view.status === 'ready' ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE;

    response.status(status);

    return view;
  }
}
