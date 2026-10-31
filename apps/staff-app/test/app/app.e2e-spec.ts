import { HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import request from 'supertest';
import { DataSource } from 'typeorm';

import * as entities from '@acme-core/entities';
import { SnakeNamingStrategy } from '@acme-libs/database';
import { AppE2EContext } from '../context/app-e2e.context';
import {
  AuthE2E,
  HealthE2E,
  LedgerE2E,
  NoteE2E,
  OrderE2E,
  ProductE2E,
  ReminderE2E,
  RoleE2E,
  UserE2E,
} from '../features';

describe('App', () => {
  jest.setTimeout(90000);

  const ctx = new AppE2EContext();

  const healthE2E = HealthE2E.of(ctx);
  const authE2E = AuthE2E.of(ctx);
  const roleE2E = RoleE2E.of(ctx);
  const userE2E = UserE2E.of(ctx);
  const ledgerE2E = LedgerE2E.of(ctx);
  const noteE2E = NoteE2E.of(ctx);
  const orderE2E = OrderE2E.of(ctx);
  const productE2E = ProductE2E.of(ctx);
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

  it('should migrate the database to the schema of every entity', async () => {
    const dataSource = new DataSource({
      type: 'mysql',
      url: ctx.moduleFixture.get(ConfigService).getOrThrow<string>('DATABASE_URL'),
      entities: Object.values(entities),
      namingStrategy: new SnakeNamingStrategy(),
    });

    await dataSource.initialize();

    try {
      const sql = await dataSource.driver.createSchemaBuilder().log();

      expect(sql.upQueries).toEqual([]);
    } finally {
      await dataSource.destroy();
    }
  });

  it('should not mount the customer-app route POST /api/auth/register', async () => {
    await request(ctx.app.getHttpServer())
      .post('/api/auth/register')
      .send({ email: 'new@example.com', password: 'secret-password' })
      .expect(HttpStatus.NOT_FOUND);
  });

  describe('Health', () => {
    healthE2E.live();
    healthE2E.ready();
  });

  describe('Identity', () => {
    describe('Auth', () => {
      authE2E.handleLogin();
      authE2E.handleMe();
    });

    describe('Role', () => {
      roleE2E.handleList();
      roleE2E.handleUpdatePermissions();
    });

    describe('User', () => {
      userE2E.handleRegister();
      userE2E.handleAssignRole();
    });
  });

  describe('Ledger', () => {
    ledgerE2E.handleList();
  });

  describe('Tools', () => {
    describe('Note', () => {
      noteE2E.handleGetMany();
      noteE2E.handleGetOne();
      noteE2E.handleGetRevisions();
      noteE2E.handleCreate();
      noteE2E.handleEdit();
      noteE2E.handleResolve();
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

  describe('Sales', () => {
    describe('Order', () => {
      orderE2E.handleGetMany();
      orderE2E.handleGetOne();
    });
  });

  describe('Catalog', () => {
    describe('Product', () => {
      productE2E.handleGetMany();
      productE2E.handleGetOne();
      productE2E.handleCreate();
      productE2E.handleRename();
      productE2E.handleArchive();
      productE2E.handleRestock();
    });
  });
});
