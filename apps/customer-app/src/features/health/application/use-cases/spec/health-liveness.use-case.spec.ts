import { HealthLivenessUseCase } from '../health-liveness.use-case';

describe('HealthLivenessUseCase', () => {
  let liveness: jest.Mock;
  let useCase: HealthLivenessUseCase;

  beforeEach(() => {
    liveness = jest.fn();
    useCase = new HealthLivenessUseCase({ liveness, readiness: jest.fn() });
  });

  it('answers the liveness of the process', () => {
    liveness.mockReturnValue({ status: 'ok', app: 'customer-app', uptimeSeconds: 7 });

    const view = useCase.execute();

    expect(view).toEqual({ status: 'ok', app: 'customer-app', uptimeSeconds: 7 });
  });
});
