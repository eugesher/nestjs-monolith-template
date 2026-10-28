import { HealthController } from '../health.controller';

describe('HealthController', () => {
  let liveness: jest.Mock;
  let readiness: jest.Mock;
  let response: { status: jest.Mock };
  let controller: HealthController;

  beforeEach(() => {
    liveness = jest.fn();
    readiness = jest.fn();
    response = { status: jest.fn() };
    controller = new HealthController({ liveness, readiness });
  });

  it('answers liveness with the view of the lib', () => {
    liveness.mockReturnValue({ status: 'ok', app: 'admin-api', uptimeSeconds: 7 });

    const body = controller.live();

    expect(body).toEqual({ status: 'ok', app: 'admin-api', uptimeSeconds: 7 });
  });

  it('answers 200 with the dependencies when ready', async () => {
    readiness.mockResolvedValue({
      status: 'ready',
      dependencies: { database: { status: 'ok', latencyMs: 2 } },
    });

    const body = await controller.ready(response);

    expect(body).toEqual({
      status: 'ready',
      dependencies: { database: { status: 'ok', latencyMs: 2 } },
    });
    expect(response.status).toHaveBeenCalledWith(200);
  });

  it('answers 503 with the dependencies when not ready', async () => {
    readiness.mockResolvedValue({
      status: 'not-ready',
      dependencies: { database: { status: 'ok', latencyMs: 2 }, cache: { status: 'error' } },
    });

    const body = await controller.ready(response);

    expect(body).toEqual({
      status: 'not-ready',
      dependencies: { database: { status: 'ok', latencyMs: 2 }, cache: { status: 'error' } },
    });
    expect(response.status).toHaveBeenCalledWith(503);
  });
});
