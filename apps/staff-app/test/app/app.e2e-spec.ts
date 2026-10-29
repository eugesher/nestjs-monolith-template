import { HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import request from 'supertest';
import { DataSource } from 'typeorm';

import * as entities from '@acme-core/entities';
import { SnakeNamingStrategy } from '@acme-libs/database';
import { AppE2EContext } from '../context/app-e2e.context';
import { HealthE2E, IamE2E, LedgerE2E, NoteE2E, AuthE2E } from '../features';

describe('App', () => {
  jest.setTimeout(90000);

  const ctx = new AppE2EContext();

  const healthE2E = HealthE2E.of(ctx);
  const authE2E = AuthE2E.of(ctx);
  const iamE2E = IamE2E.of(ctx);
  const ledgerE2E = LedgerE2E.of(ctx);
  const noteE2E = NoteE2E.of(ctx);

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

  it.each(['/api/items', '/api/reminders'])(
    'should not mount the customer-app route %s',
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

  describe('Auth', () => {
    authE2E.handleLogin();
    authE2E.handleMe();
  });

  describe('Iam', () => {
    iamE2E.handleListRoles();
    iamE2E.handleRegisterUser();
    iamE2E.handleAssignRole();
    iamE2E.handleUpdateRolePermissions();
  });

  describe('Ledger', () => {
    ledgerE2E.handleList();
  });

  describe('Note', () => {
    noteE2E.handleGetMany();
    noteE2E.handleGetOne();
    noteE2E.handleGetRevisions();
    noteE2E.handleCreate();
    noteE2E.handleEdit();
    noteE2E.handleResolve();
  });
});
