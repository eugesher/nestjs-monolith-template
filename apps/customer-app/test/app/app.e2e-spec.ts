import { HttpStatus } from '@nestjs/common';
import request from 'supertest';

import { AppE2EContext } from '../context/app-e2e.context';
import { HealthE2E, ReminderE2E, AuthE2E } from '../features';

describe('App', () => {
  jest.setTimeout(90000);

  const ctx = new AppE2EContext();

  const healthE2E = HealthE2E.of(ctx);
  const authE2E = AuthE2E.of(ctx);
  const reminderE2E = ReminderE2E.of(ctx);

  beforeAll(async () => {
    await ctx.init();
  });

  afterEach(() => {
    expect(ctx.takeRootWarnings()).toEqual([]);
  });

  afterAll(async () => {
    await ctx.close();
  });

  it.each(['/api/iam/roles', '/api/ledger', '/api/notes', '/api/products'])(
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

  describe('Reminder', () => {
    reminderE2E.hooks();
    reminderE2E.handleGetSummary();
    reminderE2E.handleGetMany();
    reminderE2E.handleCreate();
    reminderE2E.handleComplete();
    reminderE2E.handleReschedule();
    reminderE2E.handleDelete();
  });
});
