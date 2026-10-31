import { HttpStatus } from '@nestjs/common';
import request from 'supertest';

import { AppE2EContext } from '../../context/app-e2e.context';

export class OrderE2E {
  private constructor(private readonly ctx: AppE2EContext) {}

  public static of(ctx: AppE2EContext): OrderE2E {
    return new OrderE2E(ctx);
  }

  public handlePlace(): void {
    describe('POST /api/orders', () => {
      it('should place the order with a line and a -1 stock movement per unit, keep the response under the key, enqueue the ledger record and the stock check of its products under the correlation id', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .post('/api/orders')
          .set('Idempotency-Key', 'e2e-order-place-key')
          .set('x-correlation-id', 'e2e-order-place')
          .auth(this.ctx.annToken, { type: 'bearer' })
          .send({ productIds: ['100', '100'] })
          .expect(HttpStatus.CREATED);

        const records = await this.ctx.takeLedgerRecords();
        const postSubtractJobs = await this.ctx.takePostSubtractJobs();

        const actual = {
          response: { body: response.body },
          db: {
            order: await this.ctx.dataSource.query('SELECT * FROM `order` WHERE id = ?', [
              response.body.id,
            ]),
            order_product: await this.ctx.dataSource.query(
              'SELECT * FROM order_product WHERE order_id = ? ORDER BY id',
              [response.body.id],
            ),
            product_stock: await this.ctx.dataSource.query(
              'SELECT stock.* FROM product_stock stock JOIN order_product line ON line.id = stock.order_product_id WHERE line.order_id = ? ORDER BY stock.id',
              [response.body.id],
            ),
            idempotency_key: await this.ctx.dataSource.query(
              'SELECT * FROM idempotency_key WHERE idempotency_key = ?',
              ['e2e-order-place-key'],
            ),
          },
          ledger_record_queue: records.filter((record) => record.subjectId === response.body.id),
          product_stock_post_subtract_queue: postSubtractJobs,
        };

        expect(actual).toMatchSnapshot({
          response: {
            body: {
              id: expect.any(String),
              createdAt: expect.any(String),
              products: [{ id: expect.any(String) }, { id: expect.any(String) }],
            },
          },
          db: {
            order: [{ id: expect.any(String), created_at: expect.any(Date) }],
            order_product: [
              { id: expect.any(String), order_id: expect.any(String) },
              { id: expect.any(String), order_id: expect.any(String) },
            ],
            product_stock: [
              {
                id: expect.any(String),
                order_product_id: expect.any(String),
                created_at: expect.any(Date),
              },
              {
                id: expect.any(String),
                order_product_id: expect.any(String),
                created_at: expect.any(Date),
              },
            ],
            idempotency_key: [
              {
                id: expect.any(String),
                response_body: expect.any(String),
                created_at: expect.any(Date),
              },
            ],
          },
          ledger_record_queue: [
            {
              operationKey: expect.any(String),
              subjectId: expect.any(String),
              occurredAt: expect.any(String),
            },
          ],
        });
        expect(actual).toMatchObject({
          db: {
            order: [{ id: response.body.id }],
            order_product: [
              { id: response.body.products[0].id, order_id: response.body.id },
              { id: response.body.products[1].id, order_id: response.body.id },
            ],
            product_stock: [
              { order_product_id: response.body.products[0].id },
              { order_product_id: response.body.products[1].id },
            ],
          },
          ledger_record_queue: [
            {
              operationKey: `order-placed:${response.body.id}`,
              subjectId: response.body.id,
            },
          ],
        });
        expect(JSON.parse(actual.db.idempotency_key[0].response_body)).toEqual(response.body);
      });

      it('should replay the same response for the same key and body without a second order', async () => {
        const first = await request(this.ctx.app.getHttpServer())
          .post('/api/orders')
          .set('Idempotency-Key', 'e2e-order-replay-key')
          .auth(this.ctx.carolToken, { type: 'bearer' })
          .send({ productIds: ['100'] })
          .expect(HttpStatus.CREATED);

        const response = await request(this.ctx.app.getHttpServer())
          .post('/api/orders')
          .set('Idempotency-Key', 'e2e-order-replay-key')
          .auth(this.ctx.carolToken, { type: 'bearer' })
          .send({ productIds: ['100'] })
          .expect(HttpStatus.CREATED);

        const records = await this.ctx.takeLedgerRecords();

        expect(response.body).toEqual(first.body);
        expect({
          db: {
            order: await this.ctx.dataSource.query(
              'SELECT customer_id FROM `order` WHERE customer_id = ? ORDER BY id',
              ['00000000-0000-4000-8000-000000000103'],
            ),
          },
          ledger_record_queue: records.map((record) => record.action),
        }).toMatchSnapshot();
      });

      it('should refuse the same key with another body with 422', async () => {
        await request(this.ctx.app.getHttpServer())
          .post('/api/orders')
          .set('Idempotency-Key', 'e2e-order-reuse-key')
          .auth(this.ctx.annToken, { type: 'bearer' })
          .send({ productIds: ['100'] })
          .expect(HttpStatus.CREATED);

        await this.ctx.takeLedgerRecords();

        const [{ lastId }] = await this.ctx.dataSource.query(
          'SELECT MAX(id) AS lastId FROM `order`',
        );

        const response = await request(this.ctx.app.getHttpServer())
          .post('/api/orders')
          .set('Idempotency-Key', 'e2e-order-reuse-key')
          .auth(this.ctx.annToken, { type: 'bearer' })
          .send({ productIds: ['103'] })
          .expect(HttpStatus.UNPROCESSABLE_ENTITY);

        expect({
          response: { body: response.body },
          db: {
            order: await this.ctx.dataSource.query('SELECT id FROM `order` WHERE id > ?', [lastId]),
          },
        }).toMatchSnapshot();
      });

      it('should refuse the key of another customer with 422 rather than replay their order', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .post('/api/orders')
          .set('Idempotency-Key', 'e2e-order-place-key')
          .auth(this.ctx.bobToken, { type: 'bearer' })
          .send({ productIds: ['100', '100'] })
          .expect(HttpStatus.UNPROCESSABLE_ENTITY);

        expect({
          response: { body: response.body },
          db: {
            order: await this.ctx.dataSource.query(
              'SELECT id FROM `order` WHERE customer_id = ? ORDER BY id',
              ['00000000-0000-4000-8000-000000000102'],
            ),
          },
        }).toMatchSnapshot();
      });

      it('should refuse a placement without a key with 400', async () => {
        const [{ lastId }] = await this.ctx.dataSource.query(
          'SELECT MAX(id) AS lastId FROM `order`',
        );

        const response = await request(this.ctx.app.getHttpServer())
          .post('/api/orders')
          .auth(this.ctx.annToken, { type: 'bearer' })
          .send({ productIds: ['100'] })
          .expect(HttpStatus.BAD_REQUEST);

        expect({
          response: { body: response.body },
          db: {
            order: await this.ctx.dataSource.query('SELECT id FROM `order` WHERE id > ?', [lastId]),
          },
        }).toMatchSnapshot();
      });

      it('should refuse more units than in stock with 409 and the details, write nothing and release the key', async () => {
        const [{ lastId }] = await this.ctx.dataSource.query(
          'SELECT MAX(id) AS lastId FROM `order`',
        );

        const response = await request(this.ctx.app.getHttpServer())
          .post('/api/orders')
          .set('Idempotency-Key', 'e2e-order-stock-key')
          .auth(this.ctx.annToken, { type: 'bearer' })
          .send({ productIds: ['100', '106'] })
          .expect(HttpStatus.CONFLICT);

        expect({
          response: { body: response.body },
          db: {
            order: await this.ctx.dataSource.query('SELECT id FROM `order` WHERE id > ?', [lastId]),
            idempotency_key: await this.ctx.dataSource.query(
              'SELECT status FROM idempotency_key WHERE idempotency_key = ?',
              ['e2e-order-stock-key'],
            ),
          },
        }).toMatchSnapshot();
      });

      it.each([
        ['a draft product', '101'],
        ['an archived product', '105'],
        ['a deleted product', '107'],
        ['an unknown product', '999'],
      ])('should refuse %s with 404 and write nothing', async (_, productId) => {
        const [{ lastId }] = await this.ctx.dataSource.query(
          'SELECT MAX(id) AS lastId FROM `order`',
        );

        const response = await request(this.ctx.app.getHttpServer())
          .post('/api/orders')
          .set('Idempotency-Key', `e2e-order-missing-${productId}`)
          .auth(this.ctx.annToken, { type: 'bearer' })
          .send({ productIds: [productId] })
          .expect(HttpStatus.NOT_FOUND);

        expect({
          response: { body: response.body },
          db: {
            order: await this.ctx.dataSource.query('SELECT id FROM `order` WHERE id > ?', [lastId]),
          },
        }).toMatchSnapshot();
      });

      it.each([
        ['an empty list', { productIds: [] }],
        ['an id that is not a number', { productIds: ['100', 'lamp'] }],
      ])('should refuse %s with 400 from validation', async (_, body) => {
        const response = await request(this.ctx.app.getHttpServer())
          .post('/api/orders')
          .set('Idempotency-Key', 'e2e-order-invalid-key')
          .auth(this.ctx.annToken, { type: 'bearer' })
          .send(body)
          .expect(HttpStatus.BAD_REQUEST);

        expect({ response: { body: response.body } }).toMatchSnapshot();
      });

      it('should let one of two simultaneous orders for the last units through and refuse the other with 409', async () => {
        const responses = await Promise.all([
          request(this.ctx.app.getHttpServer())
            .post('/api/orders')
            .set('Idempotency-Key', 'e2e-order-race-key-1')
            .auth(this.ctx.carolToken, { type: 'bearer' })
            .send({ productIds: ['103', '103'] }),
          request(this.ctx.app.getHttpServer())
            .post('/api/orders')
            .set('Idempotency-Key', 'e2e-order-race-key-2')
            .auth(this.ctx.carolToken, { type: 'bearer' })
            .send({ productIds: ['103', '103'] }),
        ]);

        await this.ctx.takeLedgerRecords();

        const statuses = responses.map((response) => response.status).sort();
        const refused = responses.find((response) => 'code' in response.body);
        const [{ quantity }] = await this.ctx.dataSource.query(
          'SELECT SUM(quantity) AS quantity FROM product_stock WHERE product_id = ?',
          ['103'],
        );

        expect({
          statuses,
          refused: { body: refused?.body },
          db: { product_stock: { quantity: Number(quantity) } },
        }).toMatchSnapshot();
      });

      it('should refuse a caller without a token', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .post('/api/orders')
          .set('Idempotency-Key', 'e2e-order-anonymous-key')
          .send({ productIds: ['100'] })
          .expect(HttpStatus.UNAUTHORIZED);

        expect({ response: { body: response.body } }).toMatchSnapshot();
      });
    });
  }

  public handleGetMany(): void {
    describe('GET /api/orders', () => {
      it('should list only the orders of the caller, newest first, without their products', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .get('/api/orders')
          .auth(this.ctx.bobToken, { type: 'bearer' })
          .expect(HttpStatus.OK);

        expect({ response: { body: response.body } }).toMatchSnapshot();
      });

      it('should refuse a caller without a token', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .get('/api/orders')
          .expect(HttpStatus.UNAUTHORIZED);

        expect({ response: { body: response.body } }).toMatchSnapshot();
      });
    });
  }

  public handleGetOne(): void {
    describe('GET /api/orders/:orderId', () => {
      it('should read an order of the caller with a line per unit', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .get('/api/orders/601')
          .auth(this.ctx.bobToken, { type: 'bearer' })
          .expect(HttpStatus.OK);

        expect({ response: { body: response.body } }).toMatchSnapshot();
      });

      it.each([
        ['the order of another customer', '600'],
        ['an unknown order', '999'],
      ])('should answer %s with the same 404', async (_, orderId) => {
        const response = await request(this.ctx.app.getHttpServer())
          .get(`/api/orders/${orderId}`)
          .auth(this.ctx.bobToken, { type: 'bearer' })
          .expect(HttpStatus.NOT_FOUND);

        expect({ response: { body: response.body } }).toMatchSnapshot();
      });

      it('should refuse an order id that is not a number with 400 from validation', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .get('/api/orders/latest')
          .auth(this.ctx.bobToken, { type: 'bearer' })
          .expect(HttpStatus.BAD_REQUEST);

        expect({ response: { body: response.body } }).toMatchSnapshot();
      });

      it('should refuse a caller without a token', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .get('/api/orders/601')
          .expect(HttpStatus.UNAUTHORIZED);

        expect({ response: { body: response.body } }).toMatchSnapshot();
      });
    });
  }
}
