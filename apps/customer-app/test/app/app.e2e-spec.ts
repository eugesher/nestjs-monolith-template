import { HttpStatus } from '@nestjs/common';
import request from 'supertest';

import { AppE2EContext } from '../context/app-e2e.context';
import { HealthE2E, ItemE2E, ReminderE2E, SessionE2E } from '../features';

describe('App', () => {
  jest.setTimeout(90000);

  const ctx = new AppE2EContext();

  const healthE2E = HealthE2E.of(ctx);
  const sessionE2E = SessionE2E.of(ctx);
  const itemE2E = ItemE2E.of(ctx);
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

  it.each(['/api/iam/roles', '/api/ledger', '/api/notes'])(
    'should not mount the staff-app route %s',
    async (path) => {
      await request(ctx.app.getHttpServer())
        .get(path)
        .auth(ctx.adminToken, { type: 'bearer' })
        .expect(HttpStatus.NOT_FOUND);
    },
  );

  describe('Health', () => {
    healthE2E.live();
    healthE2E.ready();
  });

  describe('Session', () => {
    sessionE2E.handleLogin();
    sessionE2E.handleMe();
  });

  describe('Item', () => {
    itemE2E.handleGetMany();
    itemE2E.handleGetOne();
    itemE2E.handleCreate();
    itemE2E.handleRename();
    itemE2E.handleArchive();
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
