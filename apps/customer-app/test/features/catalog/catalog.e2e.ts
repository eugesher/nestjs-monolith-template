import { HttpStatus } from '@nestjs/common';
import request from 'supertest';

import { AppE2EContext } from '../../context/app-e2e.context';

export class CatalogE2E {
  private constructor(private readonly ctx: AppE2EContext) {}

  public static of(ctx: AppE2EContext): CatalogE2E {
    return new CatalogE2E(ctx);
  }

  public hooks(): void {
    beforeEach(async () => {
      const keys = await this.ctx.redis.keys('acme:catalog:*');

      if (keys.length > 0) {
        await this.ctx.redis.del(...keys);
      }
    });
  }

  public handleGetMany(): void {
    describe('GET /api/products', () => {
      it('should list only the active products in stock, by id, with the quantity on hand', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .get('/api/products')
          .auth(this.ctx.bobToken, { type: 'bearer' })
          .expect(HttpStatus.OK);

        expect({ response: { body: response.body } }).toMatchSnapshot();
      });

      it('should answer the page of the window with the total of every page', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .get('/api/products')
          .query({ page: 2, size: 1 })
          .auth(this.ctx.bobToken, { type: 'bearer' })
          .expect(HttpStatus.OK);

        expect({ response: { body: response.body } }).toMatchSnapshot();
      });

      it('should keep the page in the cache under the key of its window for the TTL', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .get('/api/products')
          .query({ page: 1, size: 2 })
          .auth(this.ctx.bobToken, { type: 'bearer' })
          .expect(HttpStatus.OK);

        const key = 'acme:catalog:v1:page:1:size:2';
        const cached = await this.ctx.redis.get(key);

        expect(await this.ctx.redis.keys('acme:catalog:*')).toEqual([key]);
        expect(JSON.parse(cached ?? 'null')).toEqual(response.body);
        expect(await this.ctx.redis.pttl(key)).toBeGreaterThan(55_000);
        expect(await this.ctx.redis.pttl(key)).toBeLessThanOrEqual(60_000);
      });

      it('should answer a cached page without reading the database', async () => {
        await this.ctx.redis.set(
          'acme:catalog:v1:page:1:size:20',
          JSON.stringify({
            items: [{ id: '999', sku: 'SKU-CACHED', name: 'Cached product', quantity: 1 }],
            total: 1,
            page: 1,
            size: 20,
          }),
        );

        const response = await request(this.ctx.app.getHttpServer())
          .get('/api/products')
          .auth(this.ctx.bobToken, { type: 'bearer' })
          .expect(HttpStatus.OK);

        expect({ response: { body: response.body } }).toMatchSnapshot();
      });

      it('should refuse a size of zero with 400 from validation', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .get('/api/products')
          .query({ size: 0 })
          .auth(this.ctx.bobToken, { type: 'bearer' })
          .expect(HttpStatus.BAD_REQUEST);

        expect({ response: { body: response.body } }).toMatchSnapshot();
      });

      it('should refuse a caller without a token', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .get('/api/products')
          .expect(HttpStatus.UNAUTHORIZED);

        expect({ response: { body: response.body } }).toMatchSnapshot();
      });
    });
  }
}
