import type { PinoLogger } from 'nestjs-pino';

import { AppNameEnum, HealthDependencyStatusEnum } from '@acme-libs/kernel';
import { makePinoLoggerMock, type PinoLoggerMock } from '@acme-libs/testing/observability';

import { HealthLibCheckReadinessUseCase } from '../health-lib-check-readiness.use-case';

describe('HealthLibCheckReadinessUseCase', () => {
  let logger: PinoLoggerMock;

  beforeEach(() => {
    logger = makePinoLoggerMock();
  });

  it('is ready when every dependency is ok, and logs nothing', async () => {
    const useCase = new HealthLibCheckReadinessUseCase(
      AppNameEnum.CUSTOMER_APP,
      {
        probeAll: () =>
          Promise.resolve({
            database: { status: HealthDependencyStatusEnum.OK, latencyMs: 2 },
            cache: { status: HealthDependencyStatusEnum.OK, latencyMs: 1 },
          }),
      },
      logger as unknown as PinoLogger,
    );

    const view = await useCase.execute();

    expect(view).toEqual({
      status: 'ready',
      app: 'customer-app',
      dependencies: {
        database: { status: 'ok', latencyMs: 2 },
        cache: { status: 'ok', latencyMs: 1 },
      },
    });
    expect(logger.warn).not.toHaveBeenCalled();
  });

  it('is not ready when ANY dependency fails, and names the failures in the log', async () => {
    const useCase = new HealthLibCheckReadinessUseCase(
      AppNameEnum.CUSTOMER_APP,
      {
        probeAll: () =>
          Promise.resolve({
            database: { status: HealthDependencyStatusEnum.OK, latencyMs: 2 },
            cache: { status: HealthDependencyStatusEnum.ERROR, latencyMs: null },
          }),
      },
      logger as unknown as PinoLogger,
    );

    const view = await useCase.execute();

    expect(view).toEqual({
      status: 'not-ready',
      app: 'customer-app',
      dependencies: {
        database: { status: 'ok', latencyMs: 2 },
        cache: { status: 'error', latencyMs: null },
      },
    });
    expect(logger.warn).toHaveBeenCalledWith({ failed: ['cache'] }, 'Readiness check failed');
  });
});
