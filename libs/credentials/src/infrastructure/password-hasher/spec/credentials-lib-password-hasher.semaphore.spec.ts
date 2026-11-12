import { ServiceUnavailableException } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';

import { CredentialsLibPasswordHasherSemaphore } from '../credentials-lib-password-hasher.semaphore';

describe('CredentialsLibPasswordHasherSemaphore', () => {
  let semaphore: CredentialsLibPasswordHasherSemaphore;

  beforeEach(() => {
    jest.useFakeTimers();

    const values: Record<string, number> = {
      AUTH_ARGON2_MAX_CONCURRENCY: 1,
      AUTH_ARGON2_QUEUE_TIMEOUT_MS: 1000,
    };
    const config = {
      getOrThrow: jest.fn((key: string) => values[key]),
    } as unknown as ConfigService;

    semaphore = new CredentialsLibPasswordHasherSemaphore(config);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('runs a task at once while a slot is free and returns its result', async () => {
    const result = await semaphore.run(() => Promise.resolve('hashed'));

    expect(result).toBe('hashed');
  });

  it('holds a task beyond AUTH_ARGON2_MAX_CONCURRENCY until a running one settles', async () => {
    let finishFirst: (value: string) => void = () => undefined;
    const second = jest.fn(() => Promise.resolve('second'));
    const first = semaphore.run(
      () =>
        new Promise<string>((resolve) => {
          finishFirst = resolve;
        }),
    );
    const queued = semaphore.run(second);

    await Promise.resolve();

    expect(second).not.toHaveBeenCalled();

    finishFirst('first');

    await expect(first).resolves.toBe('first');
    await expect(queued).resolves.toBe('second');
  });

  it('frees the slot of a task that throws', async () => {
    const failed = semaphore.run(() => Promise.reject(new Error('argon2 failed')));

    await expect(failed).rejects.toThrow('argon2 failed');
    await expect(semaphore.run(() => Promise.resolve('next'))).resolves.toBe('next');
  });

  it('answers 503 to a task that waits longer than AUTH_ARGON2_QUEUE_TIMEOUT_MS and drops it from the queue', async () => {
    let finishFirst: (value: string) => void = () => undefined;
    const late = jest.fn(() => Promise.resolve('late'));
    const first = semaphore.run(
      () =>
        new Promise<string>((resolve) => {
          finishFirst = resolve;
        }),
    );
    const timedOut = semaphore.run(late);

    jest.advanceTimersByTime(1000);

    await expect(timedOut).rejects.toEqual(
      new ServiceUnavailableException('Too many password checks at once, retry later'),
    );

    finishFirst('first');

    await expect(first).resolves.toBe('first');
    await expect(semaphore.run(() => Promise.resolve('next'))).resolves.toBe('next');
    expect(late).not.toHaveBeenCalled();
  });
});
