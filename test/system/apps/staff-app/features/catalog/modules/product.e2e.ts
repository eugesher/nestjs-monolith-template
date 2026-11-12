import { HttpStatus } from '@nestjs/common';
import request from 'supertest';

import type { AppE2EContext } from '../../../context/app-e2e.context';

export class ProductE2E {
  private constructor(private readonly ctx: AppE2EContext) {}

  public static of(ctx: AppE2EContext): ProductE2E {
    return new ProductE2E(ctx);
  }

  public handleCreate(): void {
    describe('POST /api/catalog/products', () => {
      it('should create a draft and append its ledger entry under the correlation id', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .post('/api/catalog/products')
          .set('Idempotency-Key', 'system-create-key')
          .set('x-correlation-id', 'e2e00000-0000-4000-8000-000000000020')
          .auth(this.ctx.editorToken, { type: 'bearer' })
          .send({ sku: 'SYS-0001', name: 'Created product' })
          .expect(HttpStatus.CREATED);

        const actual = {
          response: { body: response.body },
          db: {
            product: await this.ctx.dataSource.query('SELECT * FROM product WHERE sku = ?', [
              'SYS-0001',
            ]),
            idempotency_key: await this.ctx.dataSource.query(
              'SELECT * FROM idempotency_key WHERE idempotency_key = ?',
              ['system-create-key'],
            ),
            ledger_entry: await this.ctx.pollUntil<Record<string, unknown>[]>(
              () =>
                this.ctx.dataSource.query('SELECT * FROM ledger_entry WHERE correlation_id = ?', [
                  'e2e00000-0000-4000-8000-000000000020',
                ]),
              (rows) => rows.length >= 1,
            ),
          },
        };

        expect(actual).toMatchSnapshot({
          response: {
            body: {
              id: expect.any(String),
              createdAt: expect.any(String),
              updatedAt: expect.any(String),
            },
          },
          db: {
            product: [
              {
                id: expect.any(String),
                created_at: expect.any(Date),
                updated_at: expect.any(Date),
              },
            ],
            idempotency_key: [
              {
                id: expect.any(String),
                response_body: expect.any(String),
                created_at: expect.any(Date),
              },
            ],
            ledger_entry: [
              {
                id: expect.any(String),
                operation_key: expect.any(String),
                subject_id: expect.any(String),
                occurred_at: expect.any(Date),
                recorded_at: expect.any(Date),
              },
            ],
          },
        });
        expect(actual).toMatchObject({
          db: {
            product: [{ id: response.body.id }],
            ledger_entry: [
              {
                operation_key: `product-created:${response.body.id}`,
                subject_id: response.body.id,
              },
            ],
          },
        });
        expect(JSON.parse(actual.db.idempotency_key[0].response_body)).toEqual(response.body);
      });
    });
  }

  public handleArchive(): void {
    describe('PUT /api/catalog/products/:productId/archive', () => {
      it('should archive through core, drop the cached catalog and append its ledger entry', async () => {
        await this.ctx.redis.set('acme:catalog:v1:page:1:limit:20', '{}');

        const response = await request(this.ctx.app.getHttpServer())
          .put('/api/catalog/products/103/archive')
          .set('If-Match', '1')
          .set('x-correlation-id', 'e2e00000-0000-4000-8000-000000000021')
          .auth(this.ctx.editorToken, { type: 'bearer' })
          .expect(HttpStatus.OK);

        expect({
          response: { body: response.body },
          db: {
            product: await this.ctx.dataSource.query('SELECT * FROM product WHERE id = 103'),
            ledger_entry: await this.ctx.pollUntil<Record<string, unknown>[]>(
              () =>
                this.ctx.dataSource.query('SELECT * FROM ledger_entry WHERE correlation_id = ?', [
                  'e2e00000-0000-4000-8000-000000000021',
                ]),
              (rows) => rows.length >= 1,
            ),
          },
          cache: { keys: await this.ctx.redis.keys('acme:catalog:*') },
        }).toMatchSnapshot({
          response: { body: { updatedAt: expect.any(String) } },
          db: {
            product: [{ updated_at: expect.any(Date) }],
            ledger_entry: [
              {
                id: expect.any(String),
                occurred_at: expect.any(Date),
                recorded_at: expect.any(Date),
              },
            ],
          },
        });
      });
    });
  }

  public handlePublish(): void {
    describe('PUT /api/catalog/products/:productId/publish', () => {
      it('should publish a draft, drop the cached catalog and append its ledger entry', async () => {
        await this.ctx.redis.set('acme:catalog:v1:page:1:limit:20', '{}');

        const response = await request(this.ctx.app.getHttpServer())
          .put('/api/catalog/products/101/publish')
          .set('If-Match', '1')
          .set('x-correlation-id', 'e2e00000-0000-4000-8000-000000000022')
          .auth(this.ctx.editorToken, { type: 'bearer' })
          .expect(HttpStatus.OK);

        expect({
          response: { body: response.body },
          db: {
            product: await this.ctx.dataSource.query('SELECT * FROM product WHERE id = 101'),
            ledger_entry: await this.ctx.pollUntil<Record<string, unknown>[]>(
              () =>
                this.ctx.dataSource.query('SELECT * FROM ledger_entry WHERE correlation_id = ?', [
                  'e2e00000-0000-4000-8000-000000000022',
                ]),
              (rows) => rows.length >= 1,
            ),
          },
          cache: { keys: await this.ctx.redis.keys('acme:catalog:*') },
        }).toMatchSnapshot({
          response: { body: { updatedAt: expect.any(String) } },
          db: {
            product: [{ updated_at: expect.any(Date) }],
            ledger_entry: [
              {
                id: expect.any(String),
                occurred_at: expect.any(Date),
                recorded_at: expect.any(Date),
              },
            ],
          },
        });
      });
    });
  }
}
