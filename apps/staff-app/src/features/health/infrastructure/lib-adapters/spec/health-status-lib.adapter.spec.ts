import { HealthStatusLibAdapter } from '../health-status-lib.adapter';

describe('HealthStatusLibAdapter', () => {
  let liveness: jest.Mock;
  let readiness: jest.Mock;
  let adapter: HealthStatusLibAdapter;

  beforeEach(() => {
    liveness = jest.fn();
    readiness = jest.fn();
    adapter = new HealthStatusLibAdapter({ liveness, readiness });
  });

  describe('liveness', () => {
    it('answers the liveness of the health lib', () => {
      liveness.mockReturnValue({ status: 'ok', app: 'staff-app', uptimeSeconds: 7 });

      const view = adapter.liveness();

      expect(view).toEqual({ status: 'ok', app: 'staff-app', uptimeSeconds: 7 });
    });
  });

  describe('readiness', () => {
    it('answers the readiness of the health lib', async () => {
      readiness.mockResolvedValue({
        status: 'ready',
        dependencies: { database: { status: 'ok', latencyMs: 2 } },
      });

      const view = await adapter.readiness();

      expect(view).toEqual({
        status: 'ready',
        dependencies: { database: { status: 'ok', latencyMs: 2 } },
      });
    });
  });
});
