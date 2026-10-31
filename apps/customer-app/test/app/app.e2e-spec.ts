import { HttpStatus } from '@nestjs/common';
import request from 'supertest';

import { AppE2EContext } from '../context/app-e2e.context';
import { HealthE2E, AuthE2E, CatalogE2E, OrderE2E } from '../features';

describe('App', () => {
  jest.setTimeout(90000);

  const ctx = new AppE2EContext();

  const healthE2E = HealthE2E.of(ctx);
  const authE2E = AuthE2E.of(ctx);
  const catalogE2E = CatalogE2E.of(ctx);
  const orderE2E = OrderE2E.of(ctx);

  beforeAll(async () => {
    await ctx.init();
  });

  afterEach(() => {
    expect(ctx.takeRootWarnings()).toEqual([]);
  });

  afterAll(async () => {
    await ctx.close();
  });

  it.each(['/api/identity/roles', '/api/ledger', '/api/tools/notes', '/api/tools/reminders'])(
    'should not mount the staff-app route %s',
    async (path) => {
      await request(ctx.app.getHttpServer())
        .get(path)
        .auth(ctx.bobToken, { type: 'bearer' })
        .expect(HttpStatus.NOT_FOUND);
    },
  );

  describe('Health', () => {
    healthE2E.live();
    healthE2E.ready();
  });

  describe('Auth', () => {
    authE2E.handleRegister();
    authE2E.handleLogin();
    authE2E.handleMe();
  });

  describe('Catalog', () => {
    catalogE2E.hooks();
    catalogE2E.handleGetMany();
  });

  describe('Order', () => {
    orderE2E.handlePlace();
    orderE2E.handleGetMany();
    orderE2E.handleGetOne();
  });
});
