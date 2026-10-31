import { HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import request from 'supertest';
import { DataSource } from 'typeorm';

import * as entities from '@acme-core/entities';
import { SnakeNamingStrategy } from '@acme-libs/database';
import { AppE2EContext } from '../context/app-e2e.context';
import { CatalogE2E, HealthE2E, IdentityE2E, LedgerE2E, SalesE2E, ToolsE2E } from '../features';

describe('App', () => {
  jest.setTimeout(90000);

  const ctx = new AppE2EContext();

  const healthE2E = HealthE2E.of(ctx);
  const identityE2E = IdentityE2E.of(ctx);
  const ledgerE2E = LedgerE2E.of(ctx);
  const toolsE2E = ToolsE2E.of(ctx);
  const salesE2E = SalesE2E.of(ctx);
  const catalogE2E = CatalogE2E.of(ctx);

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
    identityE2E.execute();
  });

  describe('Ledger', () => {
    ledgerE2E.handleList();
  });

  describe('Tools', () => {
    toolsE2E.execute();
  });

  describe('Sales', () => {
    salesE2E.execute();
  });

  describe('Catalog', () => {
    catalogE2E.execute();
  });
});
