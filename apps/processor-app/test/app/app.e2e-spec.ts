import { HttpStatus } from '@nestjs/common';
import request from 'supertest';

import { AppE2EContext } from '../context/app-e2e.context';
import { HealthE2E } from '../features';
import { IdempotencyE2E, LedgerE2E, ProductStockE2E } from '../processors';

describe('App', () => {
  jest.setTimeout(90000);

  const ctx = new AppE2EContext();

  const healthE2E = HealthE2E.of(ctx);
  const ledgerE2E = LedgerE2E.of(ctx);
  const idempotencyE2E = IdempotencyE2E.of(ctx);
  const productStockE2E = ProductStockE2E.of(ctx);

  beforeAll(async () => {
    await ctx.init();
  });

  afterEach(() => {
    expect(ctx.takeRootWarnings()).toEqual([]);
  });

  afterAll(async () => {
    await ctx.close();
  });

  it.each(['/api/auth/me', '/api/products', '/api/orders', '/api/reference'])(
    'should not mount the route %s',
    async (path) => {
      await request(ctx.app.getHttpServer()).get(path).expect(HttpStatus.NOT_FOUND);
    },
  );

  describe('Health', () => {
    healthE2E.live();
    healthE2E.ready();
  });

  describe('Ledger', () => {
    ledgerE2E.handleRecord();
    ledgerE2E.handleRetryTick();
  });

  describe('Idempotency', () => {
    idempotencyE2E.handleTick();
  });

  describe('ProductStock', () => {
    productStockE2E.handleRecord();
  });
});
