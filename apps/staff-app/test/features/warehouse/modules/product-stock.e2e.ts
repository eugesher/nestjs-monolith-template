import { HttpStatus } from '@nestjs/common';
import request from 'supertest';

import type { AppE2EContext } from '../../../context/app-e2e.context';

export class ProductStockE2E {
  private constructor(private readonly ctx: AppE2EContext) {}

  public static of(ctx: AppE2EContext): ProductStockE2E {
    return new ProductStockE2E(ctx);
  }

  public handleAdd(): void {
    describe('POST /api/warehouse/product-stock/:productId/add', () => {
      it('should add the units to a sold-out product, record the key, queue the ledger record under the correlation id and keep the cached customer catalog', async () => {
        await this.ctx.redis.set('acme:catalog:v1:page:1:limit:20', '{}');

        const response = await request(this.ctx.app.getHttpServer())
          .post('/api/warehouse/product-stock/106/add')
          .set('Idempotency-Key', 'e2e-restock-key')
          .set('x-correlation-id', 'e2e00000-0000-4000-8000-000000000013')
          .auth(this.ctx.editorToken, { type: 'bearer' })
          .send({ quantity: 5 })
          .expect(HttpStatus.CREATED);

        const records = await this.ctx.takeLedgerRecords();

        const actual = {
          response: { body: response.body },
          db: {
            product_stock: await this.ctx.dataSource.query(
              'SELECT * FROM product_stock WHERE product_id = 106 ORDER BY id',
            ),
            idempotency_key: await this.ctx.dataSource.query(
              'SELECT * FROM idempotency_key WHERE idempotency_key = ? ORDER BY id',
              ['e2e-restock-key'],
            ),
          },
          ledger_record_queue: records,
          cache: { keys: await this.ctx.redis.keys('acme:catalog:*') },
        };

        expect(actual).toMatchSnapshot({
          db: {
            product_stock: [{}, {}, { id: expect.any(String), created_at: expect.any(Date) }],
            idempotency_key: [
              {
                id: expect.any(String),
                response_body: expect.any(String),
                created_at: expect.any(Date),
              },
            ],
          },
          ledger_record_queue: [
            { operationKey: expect.any(String), occurredAt: expect.any(String) },
          ],
        });
        expect(actual.ledger_record_queue[0].operationKey).toBe(
          `product-restocked:${actual.db.product_stock[2].id}`,
        );
        expect(JSON.parse(actual.db.idempotency_key[0].response_body)).toEqual(response.body);
      });

      it('should restock a draft', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .post('/api/warehouse/product-stock/101/add')
          .set('Idempotency-Key', 'e2e-restock-draft-key')
          .auth(this.ctx.adminToken, { type: 'bearer' })
          .send({ quantity: 3 })
          .expect(HttpStatus.CREATED);

        await this.ctx.takeLedgerRecords();

        expect({ response: { body: response.body } }).toMatchSnapshot();
      });

      it('should replay the same response for the same key and body without a second movement', async () => {
        const first = await request(this.ctx.app.getHttpServer())
          .post('/api/warehouse/product-stock/100/add')
          .set('Idempotency-Key', 'e2e-restock-replay-key')
          .auth(this.ctx.editorToken, { type: 'bearer' })
          .send({ quantity: 2 })
          .expect(HttpStatus.CREATED);

        const response = await request(this.ctx.app.getHttpServer())
          .post('/api/warehouse/product-stock/100/add')
          .set('Idempotency-Key', 'e2e-restock-replay-key')
          .auth(this.ctx.editorToken, { type: 'bearer' })
          .send({ quantity: 2 })
          .expect(HttpStatus.CREATED);

        await this.ctx.takeLedgerRecords();

        expect(response.body).toEqual(first.body);
        expect({
          response: { body: response.body },
          db: {
            product_stock: await this.ctx.dataSource.query(
              'SELECT product_id, quantity, order_product_id FROM product_stock WHERE product_id = 100 ORDER BY id',
            ),
          },
        }).toMatchSnapshot();
      });

      it('should refuse the same key with another quantity with 422', async () => {
        await request(this.ctx.app.getHttpServer())
          .post('/api/warehouse/product-stock/102/add')
          .set('Idempotency-Key', 'e2e-restock-reuse-key')
          .auth(this.ctx.editorToken, { type: 'bearer' })
          .send({ quantity: 1 })
          .expect(HttpStatus.CREATED);

        const response = await request(this.ctx.app.getHttpServer())
          .post('/api/warehouse/product-stock/102/add')
          .set('Idempotency-Key', 'e2e-restock-reuse-key')
          .auth(this.ctx.editorToken, { type: 'bearer' })
          .send({ quantity: 4 })
          .expect(HttpStatus.UNPROCESSABLE_ENTITY);

        await this.ctx.takeLedgerRecords();

        expect({
          response: { body: response.body },
          db: {
            product_stock: await this.ctx.dataSource.query(
              'SELECT product_id, quantity FROM product_stock WHERE product_id = 102 ORDER BY id',
            ),
          },
        }).toMatchSnapshot();
      });

      it('should restock an archived product and leave it archived', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .post('/api/warehouse/product-stock/105/add')
          .set('Idempotency-Key', 'e2e-restock-archived-key')
          .auth(this.ctx.editorToken, { type: 'bearer' })
          .send({ quantity: 5 })
          .expect(HttpStatus.CREATED);

        const records = await this.ctx.takeLedgerRecords();

        expect({
          response: { body: response.body },
          db: {
            product: await this.ctx.dataSource.query(
              'SELECT id, status, version FROM product WHERE id = 105',
            ),
            product_stock: await this.ctx.dataSource.query(
              'SELECT quantity FROM product_stock WHERE product_id = 105 ORDER BY id',
            ),
          },
          ledger_record_queue: records.map((record) => record.action),
        }).toMatchSnapshot();
      });

      it.each([
        ['an unknown product', '999'],
        ['a deleted product', '107'],
      ])('should answer %s with 404', async (_, productId) => {
        const response = await request(this.ctx.app.getHttpServer())
          .post(`/api/warehouse/product-stock/${productId}/add`)
          .set('Idempotency-Key', `e2e-restock-missing-${productId}`)
          .auth(this.ctx.editorToken, { type: 'bearer' })
          .send({ quantity: 5 })
          .expect(HttpStatus.NOT_FOUND);

        expect({ response: { body: response.body } }).toMatchSnapshot();
      });

      it.each([
        ['zero', 0],
        ['a fraction', 2.5],
      ])('should refuse a quantity of %s with 400 from validation', async (_, quantity) => {
        const response = await request(this.ctx.app.getHttpServer())
          .post('/api/warehouse/product-stock/100/add')
          .set('Idempotency-Key', 'e2e-restock-invalid-key')
          .auth(this.ctx.editorToken, { type: 'bearer' })
          .send({ quantity })
          .expect(HttpStatus.BAD_REQUEST);

        expect({ response: { body: response.body } }).toMatchSnapshot();
      });

      it('should refuse a restock without a key with 400', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .post('/api/warehouse/product-stock/100/add')
          .auth(this.ctx.editorToken, { type: 'bearer' })
          .send({ quantity: 5 })
          .expect(HttpStatus.BAD_REQUEST);

        expect({ response: { body: response.body } }).toMatchSnapshot();
      });

      it('should refuse a restock by a viewer with 403', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .post('/api/warehouse/product-stock/100/add')
          .set('Idempotency-Key', 'e2e-restock-viewer-key')
          .auth(this.ctx.viewerToken, { type: 'bearer' })
          .send({ quantity: 5 })
          .expect(HttpStatus.FORBIDDEN);

        expect({ response: { body: response.body } }).toMatchSnapshot();
      });
    });
  }
}
