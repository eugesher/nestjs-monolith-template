import { Injectable, type OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost } from '@nestjs/core';

interface IThrottleHttpSettings {
  set(setting: string, value: unknown): void;
}

@Injectable()
export class ThrottleTrustProxySetup implements OnModuleInit {
  constructor(
    private readonly adapterHost: HttpAdapterHost,
    private readonly config: ConfigService,
  ) {}

  public onModuleInit(): void {
    const hops = this.config.getOrThrow<number>('HTTP_TRUST_PROXY_HOPS');

    this.adapterHost.httpAdapter.getInstance<IThrottleHttpSettings>().set('trust proxy', hops);
  }
}
