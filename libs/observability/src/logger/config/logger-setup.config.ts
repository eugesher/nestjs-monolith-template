import { RequestMethod } from '@nestjs/common';
import { trace } from '@opentelemetry/api';
import { ClsServiceManager } from 'nestjs-cls';
import { Params } from 'nestjs-pino';
import { levels } from 'pino';
import { Options } from 'pino-http';

import { EnvHelper } from '@acme-libs/config';
import { AppNameEnum } from '@acme-libs/kernel';
import { Maybe } from '@acme-libs/toolkit';

import { CorrelationIdHelper } from '../../correlation/correlation-id.helper';

export class LoggerSetupConfig implements Params {
  public readonly pinoHttp: Options;
  public readonly forRoutes: NonNullable<Params['forRoutes']>;

  private static readonly NOISY_CONTEXTS = new Set<unknown>([
    'InstanceLoader',
    'NestFactory',
    'NestApplication',
    'RouterExplorer',
    'RoutesResolver',
  ]);

  constructor(appName: AppNameEnum) {
    const isProduction = EnvHelper.isProduction();

    this.forRoutes = [{ path: '*path', method: RequestMethod.ALL }];

    const baseOptions: Options = {
      level: process.env.LOG_LEVEL ?? (isProduction ? 'info' : 'debug'),
      mixin: () => {
        const correlationId: Maybe<string> = ClsServiceManager.getClsService().getId();
        const span = trace.getActiveSpan()?.spanContext();
        const correlation = correlationId === undefined ? {} : { correlationId };
        const tracing = span ? { traceId: span.traceId, spanId: span.spanId } : {};

        return { app: appName, ...correlation, ...tracing };
      },
      genReqId: (req, res) => CorrelationIdHelper.resolve(req, res),
      customLogLevel: (_req, res, error) => {
        if (error || res.statusCode >= 500) {
          return 'error';
        }

        return res.statusCode >= 400 ? 'warn' : 'info';
      },
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
