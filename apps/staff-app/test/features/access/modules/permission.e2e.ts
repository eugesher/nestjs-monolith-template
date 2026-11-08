import { HttpStatus } from '@nestjs/common';
import request from 'supertest';

import { AppE2EContext } from '../../../context/app-e2e.context';

export class PermissionE2E {
  private constructor(private readonly ctx: AppE2EContext) {}

  public static of(ctx: AppE2EContext): PermissionE2E {
    return new PermissionE2E(ctx);
  }

  public handleList(): void {
    describe('GET /api/access/permissions', () => {
      it('should list every permission code', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .get('/api/access/permissions')
          .auth(this.ctx.adminToken, { type: 'bearer' })
          .expect(HttpStatus.OK);

        expect({ response: { body: response.body } }).toMatchSnapshot();
      });

      it('should refuse a caller without access-management', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .get('/api/access/permissions')
          .auth(this.ctx.viewerToken, { type: 'bearer' })
          .expect(HttpStatus.FORBIDDEN);

        expect({ response: { body: response.body } }).toMatchSnapshot();
      });
    });
  }
}
