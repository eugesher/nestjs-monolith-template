import { RequestMethod } from '@nestjs/common';
import { trace } from '@opentelemetry/api';

import { AppNameEnum } from '@acme-libs/kernel';
import { LoggerSetupConfig } from '../logger-setup.config';

describe('LoggerSetupConfig', () => {
  let env: NodeJS.ProcessEnv;

  beforeEach(() => {
    env = process.env;
    process.env = { ...env };
    delete process.env.NODE_ENV;
    delete process.env.LOG_LEVEL;
  });

  afterEach(() => {
    process.env = env;
    jest.restoreAllMocks();
  });

  it('logs every route', () => {
    const config = new LoggerSetupConfig(AppNameEnum.STAFF_APP);

    expect(config.forRoutes).toEqual([{ path: '*path', method: RequestMethod.ALL }]);
  });

  it('logs info without pretty printing in production', () => {
    process.env.NODE_ENV = 'production';

    const config = new LoggerSetupConfig(AppNameEnum.STAFF_APP);

    expect(config.pinoHttp.level).toBe('info');
    expect(config.pinoHttp.transport).toBeUndefined();
  });

  it('logs debug through pino-pretty outside production', () => {
    process.env.NODE_ENV = 'development';

    const config = new LoggerSetupConfig(AppNameEnum.STAFF_APP);

    expect(config.pinoHttp.level).toBe('debug');
    expect(config.pinoHttp.transport).toEqual({
      target: 'pino-pretty',
      options: {
        colorize: true,
        singleLine: false,
        translateTime: 'SYS:yyyy-mm-dd HH:MM:ss.l',
        messageFormat: '[{app}] {if context}[{context}] {end}{msg}',
        ignore: 'pid,hostname,app,context',
      },
    });
  });

  it('takes the level from LOG_LEVEL when it is set', () => {
    process.env.NODE_ENV = 'production';
    process.env.LOG_LEVEL = 'warn';

    const config = new LoggerSetupConfig(AppNameEnum.STAFF_APP);

    expect(config.pinoHttp.level).toBe('warn');
  });

  it('adds the app name to every log line', () => {
    const config = new LoggerSetupConfig(AppNameEnum.CUSTOMER_APP);

    const mixin = config.pinoHttp.mixin?.({}, 30, {} as never);

    expect(mixin).toEqual({ app: 'customer-app' });
  });

  it('adds the trace and span ids of the active span', () => {
    const span = trace.wrapSpanContext({
      traceId: '4bf92f3577b34da6a3ce929d0e0e4736',
      spanId: '00f067aa0ba902b7',
      traceFlags: 1,
    });

    jest.spyOn(trace, 'getActiveSpan').mockReturnValue(span);

    const config = new LoggerSetupConfig(AppNameEnum.CUSTOMER_APP);
    const mixin = config.pinoHttp.mixin?.({}, 30, {} as never);

    expect(mixin).toEqual({
      app: 'customer-app',
      traceId: '4bf92f3577b34da6a3ce929d0e0e4736',
      spanId: '00f067aa0ba902b7',
    });
  });

  it('uses the inbound correlation id as the request id and returns it in the response', () => {
    const config = new LoggerSetupConfig(AppNameEnum.STAFF_APP);
    const req = { headers: { 'x-correlation-id': 'c0ffee00-0000-4000-8000-000000000001' } };
    const res = { headersSent: false, setHeader: jest.fn() };

    const id = config.pinoHttp.genReqId?.(req as never, res as never);

    expect(id).toBe('c0ffee00-0000-4000-8000-000000000001');
    expect(res.setHeader).toHaveBeenCalledWith(
      'x-correlation-id',
      'c0ffee00-0000-4000-8000-000000000001',
    );
  });

  it('adds the correlation id header to the request log', () => {
    const config = new LoggerSetupConfig(AppNameEnum.STAFF_APP);
    const req = { headers: { 'x-correlation-id': 'c0ffee00-0000-4000-8000-000000000001' } };

    const props = config.pinoHttp.customProps?.(req as never, {} as never);

    expect(props).toEqual({ correlationId: 'c0ffee00-0000-4000-8000-000000000001' });
  });

  it('removes the authorization, cookie and set-cookie headers', () => {
    const config = new LoggerSetupConfig(AppNameEnum.STAFF_APP);

    expect(config.pinoHttp.redact).toEqual({
      paths: ['req.headers.authorization', 'req.headers.cookie', 'res.headers["set-cookie"]'],
      remove: true,
    });
  });

  describe('customLogLevel', () => {
    let config: LoggerSetupConfig;

    beforeEach(() => {
      config = new LoggerSetupConfig(AppNameEnum.STAFF_APP);
    });

    it('logs a failed request as error', () => {
      const level = config.pinoHttp.customLogLevel?.(
        {} as never,
        { statusCode: 200 } as never,
        new Error('socket hang up'),
      );

      expect(level).toBe('error');
    });

    it('logs a 5xx response as error', () => {
      const level = config.pinoHttp.customLogLevel?.({} as never, { statusCode: 500 } as never);

      expect(level).toBe('error');
    });

    it('logs a 4xx response as warn', () => {
      const level = config.pinoHttp.customLogLevel?.({} as never, { statusCode: 400 } as never);

      expect(level).toBe('warn');
    });

    it('logs a response below 400 as info', () => {
      const level = config.pinoHttp.customLogLevel?.({} as never, { statusCode: 399 } as never);

      expect(level).toBe('info');
    });
  });

  describe('hooks.logMethod', () => {
    let method: jest.Mock;

    beforeEach(() => {
      method = jest.fn();
    });

    it('drops an info line of a noisy Nest context outside production', () => {
      process.env.NODE_ENV = 'development';

      const config = new LoggerSetupConfig(AppNameEnum.STAFF_APP);

      config.pinoHttp.hooks?.logMethod?.call(
        {} as never,
        [{ context: 'RoutesResolver' }, 'NoteController {/api/notes}'],
        method,
        30,
      );

      expect(method).not.toHaveBeenCalled();
    });

    it('keeps a warn line of a noisy Nest context', () => {
      process.env.NODE_ENV = 'development';

      const config = new LoggerSetupConfig(AppNameEnum.STAFF_APP);

      config.pinoHttp.hooks?.logMethod?.call(
        {} as never,
        [{ context: 'InstanceLoader' }, 'slow module'],
        method,
        40,
      );

      expect(method).toHaveBeenCalledWith({ context: 'InstanceLoader' }, 'slow module');
    });

    it('keeps an info line of any other context', () => {
      process.env.NODE_ENV = 'development';

      const config = new LoggerSetupConfig(AppNameEnum.STAFF_APP);

      config.pinoHttp.hooks?.logMethod?.call(
        {} as never,
        [{ context: 'NoteCreateUseCase' }, 'Note created'],
        method,
        30,
      );

      expect(method).toHaveBeenCalledWith({ context: 'NoteCreateUseCase' }, 'Note created');
    });

    it('keeps an info line without an object first', () => {
      process.env.NODE_ENV = 'development';

      const config = new LoggerSetupConfig(AppNameEnum.STAFF_APP);

      config.pinoHttp.hooks?.logMethod?.call({} as never, ['RoutesResolver'], method, 30);

      expect(method).toHaveBeenCalledWith('RoutesResolver');
    });

    it('keeps an info line of a noisy Nest context in production', () => {
      process.env.NODE_ENV = 'production';

      const config = new LoggerSetupConfig(AppNameEnum.STAFF_APP);

      config.pinoHttp.hooks?.logMethod?.call(
        {} as never,
        [{ context: 'RoutesResolver' }, 'NoteController {/api/notes}'],
        method,
        30,
      );

      expect(method).toHaveBeenCalledWith(
        { context: 'RoutesResolver' },
        'NoteController {/api/notes}',
      );
    });
  });
});
