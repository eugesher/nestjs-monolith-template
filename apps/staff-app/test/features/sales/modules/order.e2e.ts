import { HttpStatus } from '@nestjs/common';
import request from 'supertest';

import { AppE2EContext } from '../../../context/app-e2e.context';

export class OrderE2E {
  private constructor(private readonly ctx: AppE2EContext) {}

  public static of(ctx: AppE2EContext): OrderE2E {
    return new OrderE2E(ctx);
  }

  public handleGetMany(): void {
    describe('GET /api/sales/orders', () => {
      it('should list the orders of every customer, newest first', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .get('/api/sales/orders')
          .auth(this.ctx.viewerToken, { type: 'bearer' })
          .expect(HttpStatus.OK);

        expect({ response: { body: response.body } }).toMatchSnapshot();
      });

      it('should answer the page window it was asked for', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .get('/api/sales/orders')
          .query({ page: 2, size: 1 })
          .auth(this.ctx.viewerToken, { type: 'bearer' })
          .expect(HttpStatus.OK);

        expect({ response: { body: response.body } }).toMatchSnapshot();
      });

      it('should refuse a malformed page with 400 from validation', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .get('/api/sales/orders')
          .query({ page: 'first' })
          .auth(this.ctx.viewerToken, { type: 'bearer' })
          .expect(HttpStatus.BAD_REQUEST);

        expect({ response: { body: response.body } }).toMatchSnapshot();
      });

      it('should refuse a role without order:read with 403', async () => {
        try {
          await this.ctx.dataSource.query(
            'DELETE FROM staff_role_permissions WHERE role_id = 3 AND permission_id = 10',
          );

          const response = await request(this.ctx.app.getHttpServer())
            .get('/api/sales/orders')
            .auth(this.ctx.viewerToken, { type: 'bearer' })
            .expect(HttpStatus.FORBIDDEN);

          expect({ response: { body: response.body } }).toMatchSnapshot();
        } finally {
          await this.ctx.dataSource.query(
            'INSERT INTO staff_role_permissions (role_id, permission_id) VALUES (3, 10)',
          );
        }
      });

      it('should refuse a caller without a token with 401', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .get('/api/sales/orders')
          .expect(HttpStatus.UNAUTHORIZED);

        expect({ response: { body: response.body } }).toMatchSnapshot();
      });
    });
  }

  public handleGetOne(): void {
    describe('GET /api/sales/orders/:orderId', () => {
      it('should read the order of any customer with its products', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .get('/api/sales/orders/600')
          .auth(this.ctx.viewerToken, { type: 'bearer' })
          .expect(HttpStatus.OK);

        expect({ response: { body: response.body } }).toMatchSnapshot();
      });

      it('should answer an unknown order with 404', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .get('/api/sales/orders/999')
          .auth(this.ctx.viewerToken, { type: 'bearer' })
          .expect(HttpStatus.NOT_FOUND);

        expect({ response: { body: response.body } }).toMatchSnapshot();
      });

      it('should refuse a malformed order id with 400 from validation', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .get('/api/sales/orders/abc')
          .auth(this.ctx.viewerToken, { type: 'bearer' })
          .expect(HttpStatus.BAD_REQUEST);

        expect({ response: { body: response.body } }).toMatchSnapshot();
      });

      it('should refuse a role without order:read with 403', async () => {
        try {
          await this.ctx.dataSource.query(
            'DELETE FROM staff_role_permissions WHERE role_id = 3 AND permission_id = 10',
          );

          const response = await request(this.ctx.app.getHttpServer())
            .get('/api/sales/orders/600')
            .auth(this.ctx.viewerToken, { type: 'bearer' })
            .expect(HttpStatus.FORBIDDEN);

          expect({ response: { body: response.body } }).toMatchSnapshot();
        } finally {
          await this.ctx.dataSource.query(
            'INSERT INTO staff_role_permissions (role_id, permission_id) VALUES (3, 10)',
          );
        }
      });

      it('should refuse a caller without a token with 401', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .get('/api/sales/orders/600')
          .expect(HttpStatus.UNAUTHORIZED);

        expect({ response: { body: response.body } }).toMatchSnapshot();
      });
    });
  }
}
