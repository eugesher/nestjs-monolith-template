import { AppNameEnum } from '@acme-libs/kernel';
import { HealthLibCheckLivenessUseCase } from '../health-lib-check-liveness.use-case';

describe('HealthLibCheckLivenessUseCase', () => {
  it('names the deployable and reports whole seconds of uptime', () => {
    const useCase = new HealthLibCheckLivenessUseCase(AppNameEnum.CUSTOMER_APP, {
      seconds: () => 42.9,
    });

    const view = useCase.execute();

    expect(view).toEqual({ status: 'ok', app: 'customer-app', uptimeSeconds: 42 });
  });
});
