import { HttpStatus } from '@nestjs/common';
import request from 'supertest';

import { AppE2EContext } from '../../context/app-e2e.context';

export class ItemE2E {
  private constructor(private readonly ctx: AppE2EContext) {}

  public static of(ctx: AppE2EContext): ItemE2E {
    return new ItemE2E(ctx);
  }

  public handleGetMany(): void {
    describe('GET /api/items', () => {
      it('should list only the own items of the caller, newest first', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .get('/api/items')
          .auth(this.ctx.bobToken, { type: 'bearer' })
          .expect(HttpStatus.OK);

        expect({ response: { body: response.body } }).toMatchSnapshot();
      });
    });
  }

  public handleGetOne(): void {
    describe('GET /api/items/:itemId', () => {
      it('should read an own item', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .get('/api/items/102')
          .auth(this.ctx.annToken, { type: 'bearer' })
          .expect(HttpStatus.OK);

        expect({ response: { body: response.body } }).toMatchSnapshot();
      });

      it('should hide the item of another customer with 404', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .get('/api/items/100')
          .auth(this.ctx.carolToken, { type: 'bearer' })
          .expect(HttpStatus.NOT_FOUND);

        expect({ response: { body: response.body } }).toMatchSnapshot();
      });
    });
  }

  public handleCreate(): void {
    describe('POST /api/items', () => {
      it('should create a draft, record the key and the ledger entry under the correlation id', async () => {
        const [{ lastId }] = await this.ctx.dataSource.query('SELECT MAX(id) AS lastId FROM item');

        const response = await request(this.ctx.app.getHttpServer())
          .post('/api/items')
          .set('Idempotency-Key', 'e2e-create-key')
          .set('x-correlation-id', 'e2e-item-create')
          .auth(this.ctx.annToken, { type: 'bearer' })
          .send({ sku: 'E2E-0001', name: 'Created item' })
          .expect(HttpStatus.CREATED);

        const actual = {
          response: { body: response.body },
          db: {
            item: await this.ctx.dataSource.query('SELECT * FROM item WHERE id > ? ORDER BY id', [
              lastId,
            ]),
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
            item: [
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
            item: [{ id: response.body.id }],
            ledger_entry: [
              { operation_key: `item-created:${response.body.id}`, subject_id: response.body.id },
            ],
          },
        });
        expect(Number(response.body.id)).toBeGreaterThan(Number(lastId));
        expect(JSON.parse(actual.db.idempotency_key[0].response_body)).toEqual(response.body);
      });

      it('should replay the same response for the same key and body without a second item', async () => {
        const first = await request(this.ctx.app.getHttpServer())
          .post('/api/items')
          .set('Idempotency-Key', 'e2e-replay-key')
          .auth(this.ctx.annToken, { type: 'bearer' })
          .send({ sku: 'E2E-0002', name: 'Replayed item' })
          .expect(HttpStatus.CREATED);

        const response = await request(this.ctx.app.getHttpServer())
          .post('/api/items')
          .set('Idempotency-Key', 'e2e-replay-key')
          .auth(this.ctx.annToken, { type: 'bearer' })
          .send({ sku: 'E2E-0002', name: 'Replayed item' })
          .expect(HttpStatus.CREATED);

        expect(response.body).toEqual(first.body);
        expect({
          db: {
            item: await this.ctx.dataSource.query(
              'SELECT sku, name FROM item WHERE sku = ? ORDER BY id',
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
          .post('/api/items')
          .set('Idempotency-Key', 'e2e-reuse-key')
          .auth(this.ctx.annToken, { type: 'bearer' })
          .send({ sku: 'E2E-0003', name: 'First body' })
          .expect(HttpStatus.CREATED);

        const response = await request(this.ctx.app.getHttpServer())
          .post('/api/items')
          .set('Idempotency-Key', 'e2e-reuse-key')
          .auth(this.ctx.annToken, { type: 'bearer' })
          .send({ sku: 'E2E-0004', name: 'Another body' })
          .expect(HttpStatus.UNPROCESSABLE_ENTITY);

        expect({
          response: { body: response.body },
          db: {
            item: await this.ctx.dataSource.query(
              'SELECT sku, name FROM item WHERE sku IN (?, ?) ORDER BY id',
              ['E2E-0003', 'E2E-0004'],
            ),
          },
        }).toMatchSnapshot();
      });

      it('should refuse a create without a key with 400', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .post('/api/items')
          .auth(this.ctx.annToken, { type: 'bearer' })
          .send({ sku: 'E2E-0005', name: 'Refused item' })
          .expect(HttpStatus.BAD_REQUEST);

        expect({
          response: { body: response.body },
          db: {
            item: await this.ctx.dataSource.query('SELECT id FROM item WHERE sku = ?', [
              'E2E-0005',
            ]),
          },
        }).toMatchSnapshot();
      });

      it('should refuse a key of 129 characters with 400', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .post('/api/items')
          .set('Idempotency-Key', 'k'.repeat(129))
          .auth(this.ctx.annToken, { type: 'bearer' })
          .send({ sku: 'E2E-0005', name: 'Refused item' })
          .expect(HttpStatus.BAD_REQUEST);

        expect({
          response: { body: response.body },
          db: {
            item: await this.ctx.dataSource.query('SELECT id FROM item WHERE sku = ?', [
              'E2E-0005',
            ]),
          },
        }).toMatchSnapshot();
      });

      it('should refuse a taken sku with 409 and release the key', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .post('/api/items')
          .set('Idempotency-Key', 'e2e-taken-sku-key')
          .auth(this.ctx.annToken, { type: 'bearer' })
          .send({ sku: 'SKU-0001', name: 'Taken sku' })
          .expect(HttpStatus.CONFLICT);

        expect({
          response: { body: response.body },
          db: {
            item: await this.ctx.dataSource.query('SELECT id, name FROM item WHERE sku = ?', [
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
    describe('PATCH /api/items/:itemId/name', () => {
      it('should rename with a quoted If-Match and bump the version', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .patch('/api/items/102/name')
          .set('If-Match', '"1"')
          .auth(this.ctx.annToken, { type: 'bearer' })
          .send({ name: 'Renamed item' })
          .expect(HttpStatus.OK);

        expect({
          response: { body: response.body },
          db: { item: await this.ctx.dataSource.query('SELECT * FROM item WHERE id = 102') },
        }).toMatchSnapshot({
          response: { body: { updatedAt: expect.any(String) } },
          db: { item: [{ updated_at: expect.any(Date) }] },
        });
      });

      it('should refuse a stale If-Match with 409 and the current version', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .patch('/api/items/101/name')
          .set('If-Match', '0')
          .auth(this.ctx.bobToken, { type: 'bearer' })
          .send({ name: 'Stale rename' })
          .expect(HttpStatus.CONFLICT);

        expect({
          response: { body: response.body },
          db: { item: await this.ctx.dataSource.query('SELECT * FROM item WHERE id = 101') },
        }).toMatchSnapshot();
      });

      it('should refuse a malformed If-Match with 400', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .patch('/api/items/101/name')
          .set('If-Match', 'not-a-number')
          .auth(this.ctx.bobToken, { type: 'bearer' })
          .send({ name: 'Malformed rename' })
          .expect(HttpStatus.BAD_REQUEST);

        expect({ response: { body: response.body } }).toMatchSnapshot();
      });

      it('should hide the item of another customer from a rename with 404', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .patch('/api/items/103/name')
          .auth(this.ctx.bobToken, { type: 'bearer' })
          .send({ name: 'Foreign rename' })
          .expect(HttpStatus.NOT_FOUND);

        expect({
          response: { body: response.body },
          db: { item: await this.ctx.dataSource.query('SELECT * FROM item WHERE id = 103') },
        }).toMatchSnapshot();
      });

      it('should apply every one of concurrent renames without If-Match', async () => {
        const responses = await Promise.all(
          [1, 2, 3, 4, 5, 6].map((index) =>
            request(this.ctx.app.getHttpServer())
              .patch('/api/items/104/name')
              .auth(this.ctx.annToken, { type: 'bearer' })
              .send({ name: `Concurrent rename ${index}` }),
          ),
        );

        expect({
          statuses: responses.map((response) => response.status),
          db: {
            item: await this.ctx.dataSource.query('SELECT id, version FROM item WHERE id = 104'),
          },
        }).toMatchSnapshot();
      });
    });
  }

  public handleArchive(): void {
    describe('PATCH /api/items/:itemId/archive', () => {
      it('should archive and record one ledger entry under the correlation id', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .patch('/api/items/103/archive')
          .set('If-Match', '1')
          .set('x-correlation-id', 'e2e-item-archive')
          .auth(this.ctx.annToken, { type: 'bearer' })
          .expect(HttpStatus.OK);

        expect({
          response: { body: response.body },
          db: {
            item: await this.ctx.dataSource.query('SELECT * FROM item WHERE id = 103'),
            ledger_entry: await this.ctx.dataSource.query(
              'SELECT * FROM ledger_entry WHERE subject_id = ? ORDER BY id',
              ['103'],
            ),
          },
        }).toMatchSnapshot({
          response: { body: { updatedAt: expect.any(String) } },
          db: {
            item: [{ updated_at: expect.any(Date) }],
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

      it('should refuse to archive an archived item with 409', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .patch('/api/items/105/archive')
          .auth(this.ctx.annToken, { type: 'bearer' })
          .expect(HttpStatus.CONFLICT);

        expect({
          response: { body: response.body },
          db: {
            item: await this.ctx.dataSource.query('SELECT * FROM item WHERE id = 105'),
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
