import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiTags,
} from '@nestjs/swagger';

import { Public } from '@acme-libs/auth';
import { HealthReadinessStatusEnum } from '@acme-libs/kernel';

import { HealthLivenessUseCase, HealthReadinessUseCase } from '../../application';
import { HealthLivenessResponseDto, HealthReadinessResponseDto } from '../dto';

@ApiTags('Health')
@Public()
@Controller('health')
export class HealthController {
  constructor(
    private readonly liveness: HealthLivenessUseCase,
    private readonly readiness: HealthReadinessUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Liveness: is the process running?' })
  @ApiOkResponse({ type: HealthLivenessResponseDto })
  public live(): HealthLivenessResponseDto {
    return this.liveness.execute();
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness: can the process serve traffic right now?' })
  @ApiOkResponse({ type: HealthReadinessResponseDto })
  @ApiServiceUnavailableResponse({ type: HealthReadinessResponseDto })
  public async ready(
    @Res({ passthrough: true }) response: { status(code: HttpStatus): unknown },
  ): Promise<HealthReadinessResponseDto> {
    const view = await this.readiness.execute();
    const status =
      view.status === HealthReadinessStatusEnum.READY
        ? HttpStatus.OK
        : HttpStatus.SERVICE_UNAVAILABLE;

    response.status(status);

    return view;
  }
}
