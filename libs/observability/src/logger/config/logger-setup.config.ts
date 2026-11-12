import { RequestMethod } from '@nestjs/common';
import { trace } from '@opentelemetry/api';
import { ClsServiceManager } from 'nestjs-cls';
import type { Params } from 'nestjs-pino';
import type { Options } from 'pino-http';

import { EnvHelper } from '@acme-libs/config';
import type { AppNameEnum } from '@acme-libs/kernel';
import type { Maybe } from '@acme-libs/toolkit';

import { CorrelationIdHelper } from '../../correlation/correlation-id.helper';

export class LoggerSetupConfig implements Params {
  public readonly pinoHttp: Options;
  public readonly forRoutes: NonNullable<Params['forRoutes']>;

  constructor(appName: AppNameEnum) {
    const isProduction = EnvHelper.isProduction();

    this.forRoutes = [{ path: '*path', method: RequestMethod.ALL }];

    const baseOptions: Options = {
      level: process.env.LOG_LEVEL ?? (isProduction ? 'info' : 'debug'),
      mixin: () => {
        const correlationId = ClsServiceManager.getClsService().getId() as Maybe<string>;
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
    };

    this.pinoHttp = EnvHelper.isDevelopment()
      ? {
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
        }
      : baseOptions;
  }
}
