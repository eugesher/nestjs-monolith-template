import { AppNameEnum } from '@acme-libs/kernel';
import { HealthLibCheckLivenessUseCase } from '../health-lib-check-liveness.use-case';

describe('HealthLibCheckLivenessUseCase', () => {
  it('names the deployable and reports whole seconds of uptime', () => {
    const useCase = new HealthLibCheckLivenessUseCase(AppNameEnum.CLIENT_API, {
      seconds: () => 42.9,
    });

    const view = useCase.execute();

    expect(view).toEqual({ status: 'ok', app: 'client-api', uptimeSeconds: 42 });
  });
});
