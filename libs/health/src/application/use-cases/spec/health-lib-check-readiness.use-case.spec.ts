import { PinoLogger } from 'nestjs-pino';

import { makePinoLoggerMock, PinoLoggerMock } from '@acme-libs/observability/testing';
import { HealthLibCheckReadinessUseCase } from '../health-lib-check-readiness.use-case';

describe('HealthLibCheckReadinessUseCase', () => {
  let logger: PinoLoggerMock;

  beforeEach(() => {
    logger = makePinoLoggerMock();
  });

  it('is ready when every dependency is ok, and logs nothing', async () => {
    const useCase = new HealthLibCheckReadinessUseCase(
      { probeAll: () => Promise.resolve({ database: { status: 'ok', latencyMs: 2 } }) },
      logger as unknown as PinoLogger,
    );

    const view = await useCase.execute();

    expect(view).toEqual({
      status: 'ready',
      dependencies: { database: { status: 'ok', latencyMs: 2 } },
    });
    expect(logger.warn).not.toHaveBeenCalled();
  });

  it('is not ready when ANY dependency fails, and names the failures in the log', async () => {
    const useCase = new HealthLibCheckReadinessUseCase(
      {
        probeAll: () =>
          Promise.resolve({
            database: { status: 'ok', latencyMs: 2 },
            cache: { status: 'error' },
          }),
      },
      logger as unknown as PinoLogger,
    );

    const view = await useCase.execute();

    expect(view).toEqual({
      status: 'not-ready',
      dependencies: { database: { status: 'ok', latencyMs: 2 }, cache: { status: 'error' } },
    });
    expect(logger.warn).toHaveBeenCalledWith({ failed: ['cache'] }, 'Readiness check failed');
  });

  it('is ready when there is nothing to probe', async () => {
    const useCase = new HealthLibCheckReadinessUseCase(
      { probeAll: () => Promise.resolve({}) },
      logger as unknown as PinoLogger,
    );

    const view = await useCase.execute();

    expect(view).toEqual({ status: 'ready', dependencies: {} });
  });
});
