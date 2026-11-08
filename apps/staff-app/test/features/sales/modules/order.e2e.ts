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
          .query({ page: 2, limit: 1 })
          .auth(this.ctx.viewerToken, { type: 'bearer' })
          .expect(HttpStatus.OK);

        expect({ response: { body: response.body } }).toMatchSnapshot();
      });

      it('should list only the orders that carry the tag', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .get('/api/sales/orders')
          .query({ tagId: '302' })
          .auth(this.ctx.viewerToken, { type: 'bearer' })
          .expect(HttpStatus.OK);

        expect({ response: { body: response.body } }).toMatchSnapshot();
      });

      it('should answer an empty page for a tag no order carries', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .get('/api/sales/orders')
          .query({ tagId: '301' })
          .auth(this.ctx.viewerToken, { type: 'bearer' })
          .expect(HttpStatus.OK);

        expect(response.body).toEqual({ page: 1, count: 0, pageCount: 0, total: 0, data: [] });
      });

      it('should refuse a malformed tag id with 400 from validation', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .get('/api/sales/orders')
          .query({ tagId: 'fragile' })
          .auth(this.ctx.viewerToken, { type: 'bearer' })
          .expect(HttpStatus.BAD_REQUEST);

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
            "DELETE FROM staff_role_permissions WHERE role_id = 3 AND code = 'order:read'",
          );

          const response = await request(this.ctx.app.getHttpServer())
            .get('/api/sales/orders')
            .auth(this.ctx.viewerToken, { type: 'bearer' })
            .expect(HttpStatus.FORBIDDEN);

          expect({ response: { body: response.body } }).toMatchSnapshot();
        } finally {
          await this.ctx.dataSource.query(
            "INSERT INTO staff_role_permissions (role_id, code) VALUES (3, 'order:read')",
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

      it('should read an order with a product deleted after the order', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .get('/api/sales/orders/602')
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
            "DELETE FROM staff_role_permissions WHERE role_id = 3 AND code = 'order:read'",
          );

          const response = await request(this.ctx.app.getHttpServer())
            .get('/api/sales/orders/600')
            .auth(this.ctx.viewerToken, { type: 'bearer' })
            .expect(HttpStatus.FORBIDDEN);

          expect({ response: { body: response.body } }).toMatchSnapshot();
        } finally {
          await this.ctx.dataSource.query(
            "INSERT INTO staff_role_permissions (role_id, code) VALUES (3, 'order:read')",
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

  public handleGetTags(): void {
    describe('GET /api/sales/orders/:orderId/tags', () => {
      it('should read the tags of the order, by name', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .get('/api/sales/orders/600/tags')
          .auth(this.ctx.viewerToken, { type: 'bearer' })
          .expect(HttpStatus.OK);

        expect({ response: { body: response.body } }).toMatchSnapshot();
      });

      it('should answer an empty list for a order without tags', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .get('/api/sales/orders/601/tags')
          .auth(this.ctx.viewerToken, { type: 'bearer' })
          .expect(HttpStatus.OK);

        expect(response.body).toEqual({ tags: [] });
      });

      it('should answer an unknown order with 404', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .get('/api/sales/orders/999/tags')
          .auth(this.ctx.viewerToken, { type: 'bearer' })
          .expect(HttpStatus.NOT_FOUND);

        expect({ response: { body: response.body } }).toMatchSnapshot();
      });
    });
  }

  public handleReplaceTags(): void {
    describe('PUT /api/sales/orders/:orderId/tags', () => {
      afterEach(async () => {
        await this.ctx.dataSource.query(
          "DELETE FROM subject_tag WHERE subject_type = 'order' AND subject_id = 601",
        );
      });

      it('should link the tags of the body and answer them by name', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .put('/api/sales/orders/601/tags')
          .auth(this.ctx.editorToken, { type: 'bearer' })
          .send({ tagIds: ['300', '302', '302'] })
          .expect(HttpStatus.OK);

        const actual = {
          response: { body: response.body },
          db: {
            subject_tag: await this.ctx.dataSource.query(
              "SELECT subject_type, subject_id, tag_id FROM subject_tag WHERE subject_type = 'order' AND subject_id = 601 ORDER BY tag_id",
            ),
          },
        };

        expect(actual).toMatchSnapshot();
      });

      it('should replace the tags the order had and clear them with an empty list', async () => {
        await request(this.ctx.app.getHttpServer())
          .put('/api/sales/orders/601/tags')
          .auth(this.ctx.editorToken, { type: 'bearer' })
          .send({ tagIds: ['302', '300'] })
          .expect(HttpStatus.OK);

        const replaced = await request(this.ctx.app.getHttpServer())
          .put('/api/sales/orders/601/tags')
          .auth(this.ctx.editorToken, { type: 'bearer' })
          .send({ tagIds: ['300'] })
          .expect(HttpStatus.OK);
        const cleared = await request(this.ctx.app.getHttpServer())
          .put('/api/sales/orders/601/tags')
          .auth(this.ctx.editorToken, { type: 'bearer' })
          .send({ tagIds: [] })
          .expect(HttpStatus.OK);

        expect({
          replaced: replaced.body,
          cleared: cleared.body,
          db: {
            subject_tag: await this.ctx.dataSource.query(
              "SELECT * FROM subject_tag WHERE subject_type = 'order' AND subject_id = 601",
            ),
          },
        }).toMatchSnapshot();
      });

      it('should refuse an unknown tag with 422 and keep the tags the order had', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .put('/api/sales/orders/600/tags')
          .auth(this.ctx.editorToken, { type: 'bearer' })
          .send({ tagIds: ['302', '998', '999'] })
          .expect(HttpStatus.UNPROCESSABLE_ENTITY);

        const tags = await request(this.ctx.app.getHttpServer())
          .get('/api/sales/orders/600/tags')
          .auth(this.ctx.editorToken, { type: 'bearer' })
          .expect(HttpStatus.OK);

        expect({ response: { body: response.body }, tags: tags.body }).toMatchSnapshot();
      });

      it('should answer an unknown order with 404', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .put('/api/sales/orders/999/tags')
          .auth(this.ctx.editorToken, { type: 'bearer' })
          .send({ tagIds: ['302'] })
          .expect(HttpStatus.NOT_FOUND);

        expect({ response: { body: response.body } }).toMatchSnapshot();
      });

      it('should refuse a word among the tag ids with 400 from validation', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .put('/api/sales/orders/601/tags')
          .auth(this.ctx.editorToken, { type: 'bearer' })
          .send({ tagIds: ['fragile'] })
          .expect(HttpStatus.BAD_REQUEST);

        expect({ response: { body: response.body } }).toMatchSnapshot();
      });

      it('should refuse a role without order:write with 403', async () => {
        try {
          await this.ctx.dataSource.query(
            "DELETE FROM staff_role_permissions WHERE role_id = 2 AND code = 'order:write'",
          );

          const response = await request(this.ctx.app.getHttpServer())
            .put('/api/sales/orders/601/tags')
            .auth(this.ctx.editorToken, { type: 'bearer' })
            .send({ tagIds: ['302'] })
            .expect(HttpStatus.FORBIDDEN);

          expect({ response: { body: response.body } }).toMatchSnapshot();
        } finally {
          await this.ctx.dataSource.query(
            "INSERT INTO staff_role_permissions (role_id, code) VALUES (2, 'order:write')",
          );
        }
      });
    });
  }
}
