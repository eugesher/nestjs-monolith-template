import { RequestMethod } from '@nestjs/common';
import { trace } from '@opentelemetry/api';
import { IncomingMessage } from 'http';
import { Params } from 'nestjs-pino';
import { levels } from 'pino';
import { Options } from 'pino-http';

import { EnvHelper } from '@acme-libs/config';
import { AppNameEnum } from '@acme-libs/kernel';
import { CORRELATION_ID_HEADER } from '../../correlation/correlation-id-header.const';
import { CorrelationIdHelper } from '../../correlation/correlation-id.helper';

export class LoggerSetupConfig implements Params {
  private static readonly NOISY_CONTEXTS = new Set<unknown>([
    'InstanceLoader',
    'NestFactory',
    'NestApplication',
    'RouterExplorer',
    'RoutesResolver',
  ]);

  public readonly pinoHttp: Options;
  public readonly forRoutes: NonNullable<Params['forRoutes']>;

  constructor(appName: AppNameEnum) {
    const isProduction = EnvHelper.isProduction();

    this.forRoutes = [{ path: '*path', method: RequestMethod.ALL }];

    const baseOptions: Options = {
      level: process.env.LOG_LEVEL ?? (isProduction ? 'info' : 'debug'),
      mixin: () => {
        const span = trace.getActiveSpan()?.spanContext();

        return span
          ? { app: appName, traceId: span.traceId, spanId: span.spanId }
          : { app: appName };
      },
      genReqId: (req, res) => CorrelationIdHelper.resolve(req, res),
      customLogLevel: (_req, res, error) => {
        if (error || res.statusCode >= 500) {
          return 'error';
        }

        return res.statusCode >= 400 ? 'warn' : 'info';
      },
      customProps: (req: IncomingMessage) => ({
        correlationId: req.headers[CORRELATION_ID_HEADER],
      }),
      redact: {
        paths: ['req.headers.authorization', 'req.headers.cookie', 'res.headers["set-cookie"]'],
        remove: true,
      },
      hooks: {
        logMethod(args, method, level) {
          const noisy = !isProduction && LoggerSetupConfig.isNoisy(args[0], level);

          if (!noisy) {
            method.apply(this, args);
          }
        },
      },
    };

    this.pinoHttp = isProduction
      ? baseOptions
      : {
          ...baseOptions,
          transport: {
            target: 'pino-pretty',
            options: {
              colorize: true,
              singleLine: false,
              translateTime: 'SYS:yyyy-mm-dd HH:MM:ss.l',
              messageFormat: '[{app}] {if context}[{context}] {end}{msg}',
              ignore: 'pid,hostname,app,context',
            },
          },
        };
  }

  private static isNoisy(first: unknown, level: number): boolean {
    if (level !== levels.values.info || typeof first !== 'object' || first === null) {
      return false;
    }

    const { context } = first as { context?: unknown };

    return LoggerSetupConfig.NOISY_CONTEXTS.has(context);
  }
}
