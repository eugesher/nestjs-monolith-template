import { ServiceUnavailableException } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';

export class CredentialsLibPasswordHasherSemaphore {
  private readonly maxConcurrency: number;
  private readonly queueTimeoutMs: number;
  private readonly waiting: (() => void)[] = [];
  private active = 0;

  constructor(config: ConfigService) {
    this.maxConcurrency = config.getOrThrow<number>('AUTH_ARGON2_MAX_CONCURRENCY');
    this.queueTimeoutMs = config.getOrThrow<number>('AUTH_ARGON2_QUEUE_TIMEOUT_MS');
  }

  public async run<T>(task: () => Promise<T>): Promise<T> {
    await this.acquire();

    try {
      return await task();
    } finally {
      this.release();
    }
  }

  private async acquire(): Promise<void> {
    if (this.active < this.maxConcurrency) {
      this.active++;

      return;
    }

    await new Promise<void>((resolve, reject) => {
      const grant = (): void => {
        clearTimeout(timer);
        resolve();
      };
      const timer = setTimeout(() => {
        this.waiting.splice(this.waiting.indexOf(grant), 1);
        reject(new ServiceUnavailableException('Too many password checks at once, retry later'));
      }, this.queueTimeoutMs);

      this.waiting.push(grant);
    });
  }

  private release(): void {
    const next = this.waiting.shift();

    if (next) {
      next();

      return;
    }

    this.active--;
  }
}
