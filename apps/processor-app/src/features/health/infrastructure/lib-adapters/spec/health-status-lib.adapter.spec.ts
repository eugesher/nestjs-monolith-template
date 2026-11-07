import { HealthStatusLibAdapter } from '../health-status-lib.adapter';

describe('HealthStatusLibAdapter', () => {
  let handleLiveness: jest.Mock;
  let handleReadiness: jest.Mock;
  let adapter: HealthStatusLibAdapter;

  beforeEach(() => {
    handleLiveness = jest.fn();
    handleReadiness = jest.fn();
    adapter = new HealthStatusLibAdapter({ handleLiveness, handleReadiness });
  });

  describe('liveness', () => {
    it('answers the liveness of the health lib', () => {
      handleLiveness.mockReturnValue({ status: 'ok', app: 'processor-app', uptimeSeconds: 7 });

      const view = adapter.liveness();

      expect(view).toEqual({ status: 'ok', app: 'processor-app', uptimeSeconds: 7 });
    });
  });

  describe('readiness', () => {
    it('answers the readiness of the health lib', async () => {
      handleReadiness.mockResolvedValue({
        status: 'ready',
        dependencies: {
          database: { status: 'ok', latencyMs: 2 },
          cache: { status: 'ok', latencyMs: 1 },
        },
      });

      const view = await adapter.readiness();

      expect(view).toEqual({
        status: 'ready',
        dependencies: {
          database: { status: 'ok', latencyMs: 2 },
          cache: { status: 'ok', latencyMs: 1 },
        },
      });
    });
  });
});
