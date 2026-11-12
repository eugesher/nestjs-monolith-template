import { HttpStatus } from '@nestjs/common';
import request from 'supertest';

import { LEDGER_LIB_PORT, type ILedgerLibPort } from '@acme-libs/contracts/ledger';

import type { AppE2EContext } from '../../context/app-e2e.context';

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

  public handleEnqueue(): void {
    describe('LEDGER_LIB_PORT handleEnqueue', () => {
      it('should keep one job for a record enqueued twice under the same operation key', async () => {
        const ledger = this.ctx.moduleFixture.get<ILedgerLibPort>(LEDGER_LIB_PORT);
        const record = {
          operationKey: 'e2e-enqueue:1',
          subjectType: 'product',
          subjectId: '100',
          action: 'ProductCreated',
          payload: { name: 'Twice' },
          occurredAt: '2026-01-05T08:00:00.000Z',
          correlationId: 'e2e00000-0000-4000-8000-000000000019',
        };

        await ledger.handleEnqueue(record);
        await ledger.handleEnqueue(record);

        const records = await this.ctx.takeLedgerRecords();

        expect(records).toEqual([record]);
      });
    });
  }
}
