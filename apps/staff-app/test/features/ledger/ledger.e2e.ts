import { HttpStatus } from '@nestjs/common';
import request from 'supertest';

import { AppE2EContext } from '../../context/app-e2e.context';

export class LedgerE2E {
  private constructor(private readonly ctx: AppE2EContext) {}

  public static of(ctx: AppE2EContext): LedgerE2E {
    return new LedgerE2E(ctx);
  }

  public handleList(): void {
    describe('GET /api/ledger', () => {
      it('should list the entries of one subject', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .get('/api/ledger')
          .query({ subjectType: 'product', subjectId: '100' })
          .auth(this.ctx.viewerToken, { type: 'bearer' })
          .expect(HttpStatus.OK);

        expect({ response: { body: response.body } }).toMatchSnapshot();
      });

      it('should refuse a malformed page with 400 from validation', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .get('/api/ledger')
          .query({ page: 'first' })
          .auth(this.ctx.viewerToken, { type: 'bearer' })
          .expect(HttpStatus.BAD_REQUEST);

        expect({ response: { body: response.body } }).toMatchSnapshot();
      });
    });
  }
}
