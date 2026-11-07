import { HealthReadinessUseCase } from '../health-readiness.use-case';

describe('HealthReadinessUseCase', () => {
  let readiness: jest.Mock;
  let useCase: HealthReadinessUseCase;

  beforeEach(() => {
    readiness = jest.fn();
    useCase = new HealthReadinessUseCase({ liveness: jest.fn(), readiness });
  });

  it('answers the readiness of the dependencies', async () => {
    readiness.mockResolvedValue({
      status: 'not-ready',
      dependencies: {
        database: { status: 'ok', latencyMs: 2 },
        cache: { status: 'error', latencyMs: null },
      },
    });

    const view = await useCase.execute();

    expect(view).toEqual({
      status: 'not-ready',
      dependencies: {
        database: { status: 'ok', latencyMs: 2 },
        cache: { status: 'error', latencyMs: null },
      },
    });
  });
});
