import { DataSource } from 'typeorm';

import { ICachePort } from '@acme-libs/contracts/cache';
import { HealthLibDependencyProbeAdapter } from '../health-lib-dependency-probe.adapter';

describe('HealthLibDependencyProbeAdapter', () => {
  let query: jest.Mock;
  let get: jest.Mock;
  let adapter: HealthLibDependencyProbeAdapter;

  beforeEach(() => {
    query = jest.fn().mockResolvedValue([{ 1: '1' }]);
    get = jest.fn().mockResolvedValue(undefined);
    adapter = new HealthLibDependencyProbeAdapter(
      { get } as unknown as ICachePort,
      { query } as unknown as DataSource,
    );
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('reports the database and the cache as ok with their latency', async () => {
    const dependencies = await adapter.probeAll();

    expect(dependencies).toEqual({
      database: { status: 'ok', latencyMs: expect.any(Number) as number },
      cache: { status: 'ok', latencyMs: expect.any(Number) as number },
    });
  });

  it('probes the database with the cheapest round trip', async () => {
    await adapter.probeAll();

    expect(query).toHaveBeenCalledWith('SELECT 1');
  });

  it('probes the cache with a read of the health probe key', async () => {
    await adapter.probeAll();

    expect(get).toHaveBeenCalledWith('acme:health:probe');
  });

  it('measures the latency of a probe', async () => {
    jest.useFakeTimers();
    query.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve([{ 1: '1' }]), 30)),
    );

    const result = adapter.probeAll();

    await jest.advanceTimersByTimeAsync(30);

    const dependencies = await result;

    expect(dependencies.database).toEqual({ status: 'ok', latencyMs: 30 });
  });

  it('folds a failing probe into its own entry and never rejects', async () => {
    get.mockRejectedValue(new Error('connection refused'));

    const dependencies = await adapter.probeAll();

    expect(dependencies).toEqual({
      database: { status: 'ok', latencyMs: expect.any(Number) as number },
      cache: { status: 'error' },
    });
  });

  it('waits for a slow probe up to the timeout', async () => {
    jest.useFakeTimers();
    get.mockImplementation(() => new Promise<never>(() => undefined));

    const result = adapter.probeAll();
    let settled = false;

    void result.then(() => {
      settled = true;
    });
    await jest.advanceTimersByTimeAsync(999);

    expect(settled).toBe(false);
  });

  it('gives up on a hanging probe after 1000 ms', async () => {
    jest.useFakeTimers();
    get.mockImplementation(() => new Promise<never>(() => undefined));

    const result = adapter.probeAll();

    await jest.advanceTimersByTimeAsync(1000);

    const dependencies = await result;

    expect(dependencies).toEqual({
      database: { status: 'ok', latencyMs: expect.any(Number) as number },
      cache: { status: 'error' },
    });
  });

  it('runs the probes concurrently', async () => {
    jest.useFakeTimers();
    query.mockImplementation(() => new Promise<never>(() => undefined));
    get.mockImplementation(() => new Promise<never>(() => undefined));

    const result = adapter.probeAll();

    expect(query).toHaveBeenCalledTimes(1);
    expect(get).toHaveBeenCalledTimes(1);

    await jest.advanceTimersByTimeAsync(1000);

    const dependencies = await result;

    expect(dependencies).toEqual({ database: { status: 'error' }, cache: { status: 'error' } });
  });

  it('leaves no timer behind once the probes answer', async () => {
    jest.useFakeTimers();

    await adapter.probeAll();

    expect(jest.getTimerCount()).toBe(0);
  });
});
