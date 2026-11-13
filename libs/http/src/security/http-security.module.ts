import {
  RequestMethod,
  type DynamicModule,
  type MiddlewareConsumer,
  type NestModule,
} from '@nestjs/common';
import helmet, { type HelmetOptions } from 'helmet';

import { HttpCorsMiddleware } from './middlewares/http-cors.middleware';

export class HttpSecurityModule implements NestModule {
  private static readonly HELMET_OPTIONS: HelmetOptions = {
    contentSecurityPolicy: {
      useDefaults: false,
      directives: { defaultSrc: ["'none'"], frameAncestors: ["'none'"] },
    },
    frameguard: { action: 'deny' },
  };

  public static forRoot(): DynamicModule {
    return { module: HttpSecurityModule };
  }

  public configure(consumer: MiddlewareConsumer): void {
    const headers = helmet(HttpSecurityModule.HELMET_OPTIONS);

    consumer
      .apply(headers, HttpCorsMiddleware)
      .forRoutes({ path: '*path', method: RequestMethod.ALL });
  }
}
