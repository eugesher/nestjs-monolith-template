import { HttpStatus } from '@nestjs/common';
import request from 'supertest';

import { AppE2EContext } from '../../context/app-e2e.context';

export class ProductE2E {
  private constructor(private readonly ctx: AppE2EContext) {}

  public static of(ctx: AppE2EContext): ProductE2E {
    return new ProductE2E(ctx);
  }

  public handleGetMany(): void {
    describe('GET /api/products', () => {
      it('should list the catalog, newest first', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .get('/api/products')
          .auth(this.ctx.viewerToken, { type: 'bearer' })
          .expect(HttpStatus.OK);

        expect({ response: { body: response.body } }).toMatchSnapshot();
      });
    });
  }

  public handleGetOne(): void {
    describe('GET /api/products/:productId', () => {
      it('should read a product', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .get('/api/products/102')
          .auth(this.ctx.viewerToken, { type: 'bearer' })
          .expect(HttpStatus.OK);

        expect({ response: { body: response.body } }).toMatchSnapshot();
      });

      it('should answer an unknown product with 404', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .get('/api/products/999')
          .auth(this.ctx.viewerToken, { type: 'bearer' })
          .expect(HttpStatus.NOT_FOUND);

        expect({ response: { body: response.body } }).toMatchSnapshot();
      });
    });
  }

  public handleCreate(): void {
    describe('POST /api/products', () => {
      it('should create a draft, record the key and the ledger entry under the correlation id', async () => {
        const [{ lastId }] = await this.ctx.dataSource.query(
          'SELECT MAX(id) AS lastId FROM product',
        );

        const response = await request(this.ctx.app.getHttpServer())
          .post('/api/products')
          .set('Idempotency-Key', 'e2e-create-key')
          .set('x-correlation-id', 'e2e-product-create')
          .auth(this.ctx.editorToken, { type: 'bearer' })
          .send({ sku: 'E2E-0001', name: 'Created product' })
          .expect(HttpStatus.CREATED);

        const actual = {
          response: { body: response.body },
          db: {
            product: await this.ctx.dataSource.query(
              'SELECT * FROM product WHERE id > ? ORDER BY id',
              [lastId],
            ),
            idempotency_key: await this.ctx.dataSource.query(
              'SELECT * FROM idempotency_key WHERE idempotency_key = ? ORDER BY id',
              ['e2e-create-key'],
            ),
            ledger_entry: await this.ctx.dataSource.query(
              'SELECT * FROM ledger_entry WHERE subject_id = ? ORDER BY id',
              [response.body.id],
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
        expect(Number(response.body.id)).toBeGreaterThan(Number(lastId));
        expect(JSON.parse(actual.db.idempotency_key[0].response_body)).toEqual(response.body);
      });

      it('should replay the same response for the same key and body without a second product', async () => {
        const first = await request(this.ctx.app.getHttpServer())
          .post('/api/products')
          .set('Idempotency-Key', 'e2e-replay-key')
          .auth(this.ctx.editorToken, { type: 'bearer' })
          .send({ sku: 'E2E-0002', name: 'Replayed product' })
          .expect(HttpStatus.CREATED);

        const response = await request(this.ctx.app.getHttpServer())
          .post('/api/products')
          .set('Idempotency-Key', 'e2e-replay-key')
          .auth(this.ctx.editorToken, { type: 'bearer' })
          .send({ sku: 'E2E-0002', name: 'Replayed product' })
          .expect(HttpStatus.CREATED);

        expect(response.body).toEqual(first.body);
        expect({
          db: {
            product: await this.ctx.dataSource.query(
              'SELECT sku, name FROM product WHERE sku = ? ORDER BY id',
              ['E2E-0002'],
            ),
            ledger_entry: await this.ctx.dataSource.query(
              'SELECT action FROM ledger_entry WHERE subject_id = ? ORDER BY id',
              [first.body.id],
            ),
          },
        }).toMatchSnapshot();
      });

      it('should refuse the same key with another body with 422', async () => {
        await request(this.ctx.app.getHttpServer())
          .post('/api/products')
          .set('Idempotency-Key', 'e2e-reuse-key')
          .auth(this.ctx.editorToken, { type: 'bearer' })
          .send({ sku: 'E2E-0003', name: 'First body' })
          .expect(HttpStatus.CREATED);

        const response = await request(this.ctx.app.getHttpServer())
          .post('/api/products')
          .set('Idempotency-Key', 'e2e-reuse-key')
          .auth(this.ctx.editorToken, { type: 'bearer' })
          .send({ sku: 'E2E-0004', name: 'Another body' })
          .expect(HttpStatus.UNPROCESSABLE_ENTITY);

        expect({
          response: { body: response.body },
          db: {
            product: await this.ctx.dataSource.query(
              'SELECT sku, name FROM product WHERE sku IN (?, ?) ORDER BY id',
              ['E2E-0003', 'E2E-0004'],
            ),
          },
        }).toMatchSnapshot();
      });

      it('should refuse a create without a key with 400', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .post('/api/products')
          .auth(this.ctx.editorToken, { type: 'bearer' })
          .send({ sku: 'E2E-0005', name: 'Refused product' })
          .expect(HttpStatus.BAD_REQUEST);

        expect({
          response: { body: response.body },
          db: {
            product: await this.ctx.dataSource.query('SELECT id FROM product WHERE sku = ?', [
              'E2E-0005',
            ]),
          },
        }).toMatchSnapshot();
      });

      it('should refuse a key of 129 characters with 400', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .post('/api/products')
          .set('Idempotency-Key', 'k'.repeat(129))
          .auth(this.ctx.editorToken, { type: 'bearer' })
          .send({ sku: 'E2E-0005', name: 'Refused product' })
          .expect(HttpStatus.BAD_REQUEST);

        expect({
          response: { body: response.body },
          db: {
            product: await this.ctx.dataSource.query('SELECT id FROM product WHERE sku = ?', [
              'E2E-0005',
            ]),
          },
        }).toMatchSnapshot();
      });

      it('should refuse a taken sku with 409 and release the key', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .post('/api/products')
          .set('Idempotency-Key', 'e2e-taken-sku-key')
          .auth(this.ctx.editorToken, { type: 'bearer' })
          .send({ sku: 'SKU-0001', name: 'Taken sku' })
          .expect(HttpStatus.CONFLICT);

        expect({
          response: { body: response.body },
          db: {
            product: await this.ctx.dataSource.query('SELECT id, name FROM product WHERE sku = ?', [
              'SKU-0001',
            ]),
            idempotency_key: await this.ctx.dataSource.query(
              'SELECT status FROM idempotency_key WHERE idempotency_key = ?',
              ['e2e-taken-sku-key'],
            ),
          },
        }).toMatchSnapshot();
      });
    });
  }

  public handleRename(): void {
    describe('PATCH /api/products/:productId/name', () => {
      it('should rename with a quoted If-Match and bump the version', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .patch('/api/products/102/name')
          .set('If-Match', '"1"')
          .auth(this.ctx.editorToken, { type: 'bearer' })
          .send({ name: 'Renamed product' })
          .expect(HttpStatus.OK);

        expect({
          response: { body: response.body },
          db: { product: await this.ctx.dataSource.query('SELECT * FROM product WHERE id = 102') },
        }).toMatchSnapshot({
          response: { body: { updatedAt: expect.any(String) } },
          db: { product: [{ updated_at: expect.any(Date) }] },
        });
      });

      it('should refuse a stale If-Match with 409 and the current version', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .patch('/api/products/101/name')
          .set('If-Match', '0')
          .auth(this.ctx.editorToken, { type: 'bearer' })
          .send({ name: 'Stale rename' })
          .expect(HttpStatus.CONFLICT);

        expect({
          response: { body: response.body },
          db: { product: await this.ctx.dataSource.query('SELECT * FROM product WHERE id = 101') },
        }).toMatchSnapshot();
      });

      it('should refuse a malformed If-Match with 400', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .patch('/api/products/101/name')
          .set('If-Match', 'not-a-number')
          .auth(this.ctx.editorToken, { type: 'bearer' })
          .send({ name: 'Malformed rename' })
          .expect(HttpStatus.BAD_REQUEST);

        expect({ response: { body: response.body } }).toMatchSnapshot();
      });

      it('should refuse a rename by a viewer with 403', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .patch('/api/products/103/name')
          .auth(this.ctx.viewerToken, { type: 'bearer' })
          .send({ name: 'Viewer rename' })
          .expect(HttpStatus.FORBIDDEN);

        expect({
          response: { body: response.body },
          db: { product: await this.ctx.dataSource.query('SELECT * FROM product WHERE id = 103') },
        }).toMatchSnapshot();
      });

      it('should apply every one of concurrent renames without If-Match', async () => {
        const responses = await Promise.all(
          [1, 2, 3, 4, 5, 6].map((index) =>
            request(this.ctx.app.getHttpServer())
              .patch('/api/products/104/name')
              .auth(this.ctx.editorToken, { type: 'bearer' })
              .send({ name: `Concurrent rename ${index}` }),
          ),
        );

        expect({
          statuses: responses.map((response) => response.status),
          db: {
            product: await this.ctx.dataSource.query(
              'SELECT id, version FROM product WHERE id = 104',
            ),
          },
        }).toMatchSnapshot();
      });
    });
  }

  public handleArchive(): void {
    describe('PATCH /api/products/:productId/archive', () => {
      it('should archive and record one ledger entry under the correlation id', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .patch('/api/products/103/archive')
          .set('If-Match', '1')
          .set('x-correlation-id', 'e2e-product-archive')
          .auth(this.ctx.editorToken, { type: 'bearer' })
          .expect(HttpStatus.OK);

        expect({
          response: { body: response.body },
          db: {
            product: await this.ctx.dataSource.query('SELECT * FROM product WHERE id = 103'),
            ledger_entry: await this.ctx.dataSource.query(
              'SELECT * FROM ledger_entry WHERE subject_id = ? ORDER BY id',
              ['103'],
            ),
          },
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

      it('should refuse to archive an archived product with 409', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .patch('/api/products/105/archive')
          .auth(this.ctx.editorToken, { type: 'bearer' })
          .expect(HttpStatus.CONFLICT);

        expect({
          response: { body: response.body },
          db: {
            product: await this.ctx.dataSource.query('SELECT * FROM product WHERE id = 105'),
            ledger_entry: await this.ctx.dataSource.query(
              'SELECT * FROM ledger_entry WHERE subject_id = ? ORDER BY id',
              ['105'],
            ),
          },
        }).toMatchSnapshot();
      });
    });
  }
}
