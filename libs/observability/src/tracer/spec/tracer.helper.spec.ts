import { diag, DiagConsoleLogger } from '@opentelemetry/api';
import { NodeSDK } from '@opentelemetry/sdk-node';

import { TracerHelper } from '../tracer.helper';

jest.mock('@opentelemetry/sdk-node', () => ({
  NodeSDK: jest.fn().mockImplementation(() => ({
    start: jest.fn(),
    shutdown: jest.fn().mockResolvedValue(undefined),
  })),
}));
jest.mock('@opentelemetry/auto-instrumentations-node', () => ({
  getNodeAutoInstrumentations: jest.fn().mockReturnValue(['http-instrumentation']),
}));

describe('TracerHelper', () => {
  let env: NodeJS.ProcessEnv;
  let once: jest.SpyInstance;

  beforeEach(() => {
    env = process.env;
    process.env = { ...env };
    delete process.env.OTEL_SDK_DISABLED;
    delete process.env.OTEL_SERVICE_NAME;
    delete process.env.NODE_ENV;
    delete process.env.OTEL_DIAG_LOG_LEVEL;
    once = jest.spyOn(process, 'once').mockReturnValue(process);
  });

  afterEach(() => {
    process.env = env;
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('start', () => {
    it.each([undefined, 'true'])('stays off when OTEL_SDK_DISABLED is %p', (disabled) => {
      if (disabled !== undefined) {
        process.env.OTEL_SDK_DISABLED = disabled;
      }

      const sdk = TracerHelper.start() as unknown as {
        start: jest.Mock;
        shutdown: jest.Mock;
      } | null;

      expect(sdk).toBeNull();
      expect(NodeSDK).not.toHaveBeenCalled();
    });

    it('starts the SDK with the service and environment of the process', () => {
      process.env.OTEL_SDK_DISABLED = 'false';
      process.env.OTEL_SERVICE_NAME = 'client-api';
      process.env.NODE_ENV = 'production';

      const sdk = TracerHelper.start() as unknown as {
        start: jest.Mock;
        shutdown: jest.Mock;
      } | null;

      const [[options]] = (NodeSDK as unknown as jest.Mock).mock.calls as [
        [{ resource: { attributes: Record<string, string> }; instrumentations: unknown[] }],
      ];

      expect(sdk?.start).toHaveBeenCalledTimes(1);
      expect(options.resource.attributes).toEqual({
        'service.name': 'client-api',
        'deployment.environment.name': 'production',
      });
      expect(options.instrumentations).toEqual([['http-instrumentation']]);
      expect(once).toHaveBeenCalledWith('SIGTERM', expect.any(Function));
      expect(once).toHaveBeenCalledWith('SIGINT', expect.any(Function));
    });

    it('prints the SDK diagnostics when OTEL_DIAG_LOG_LEVEL is debug', () => {
      process.env.OTEL_SDK_DISABLED = 'false';
      process.env.OTEL_DIAG_LOG_LEVEL = 'debug';

      const setLogger = jest.spyOn(diag, 'setLogger').mockReturnValue(true);

      TracerHelper.start();

      expect(setLogger).toHaveBeenCalledWith(expect.any(DiagConsoleLogger), 70);
    });

    it('names an unnamed service and environment by the defaults', () => {
      process.env.OTEL_SDK_DISABLED = 'false';

      TracerHelper.start();

      const [[options]] = (NodeSDK as unknown as jest.Mock).mock.calls as [
        [{ resource: { attributes: Record<string, string> } }],
      ];

      expect(options.resource.attributes).toEqual({
        'service.name': 'unknown-service',
        'deployment.environment.name': 'development',
      });
    });

    it.each(['SIGTERM', 'SIGINT'])('shuts the SDK down and exits on %s', async (signal) => {
      process.env.OTEL_SDK_DISABLED = 'false';

      const exit = jest.spyOn(process, 'exit').mockReturnValue(undefined as never);
      const sdk = TracerHelper.start() as unknown as {
        start: jest.Mock;
        shutdown: jest.Mock;
      } | null;
      const calls = once.mock.calls as [string, () => void][];
      const [, onSignal] = calls.find(([name]) => name === signal) ?? [];

      onSignal?.();
      await new Promise((resolve) => setImmediate(resolve));

      expect(sdk?.shutdown).toHaveBeenCalledTimes(1);
      expect(exit).toHaveBeenCalledWith(0);
    });

    it('reports a failed shutdown and still exits', async () => {
      process.env.OTEL_SDK_DISABLED = 'false';

      const exit = jest.spyOn(process, 'exit').mockReturnValue(undefined as never);
      const error = jest.spyOn(console, 'error').mockReturnValue(undefined);
      const sdk = TracerHelper.start() as unknown as {
        start: jest.Mock;
        shutdown: jest.Mock;
      } | null;
      const [[, onSigterm]] = once.mock.calls as [[string, () => void]];

      sdk?.shutdown.mockRejectedValueOnce(new Error('collector down'));
      onSigterm();
      await new Promise((resolve) => setImmediate(resolve));

      expect(error).toHaveBeenCalledWith(
        'OpenTelemetry shutdown error',
        new Error('collector down'),
      );
      expect(exit).toHaveBeenCalledWith(0);
    });
  });
});
