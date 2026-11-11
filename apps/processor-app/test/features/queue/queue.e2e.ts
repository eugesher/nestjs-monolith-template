import { HttpStatus } from '@nestjs/common';
import request from 'supertest';

import type { AppE2EContext } from '../../context/app-e2e.context';

export class QueueE2E {
  private constructor(private readonly ctx: AppE2EContext) {}

  public static of(ctx: AppE2EContext): QueueE2E {
    return new QueueE2E(ctx);
  }

  public list(): void {
    describe('GET /api/queues', () => {
      it('should list the queues with their job counts', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .get('/api/queues')
          .auth(this.ctx.viewerToken, { type: 'bearer' })
          .expect(HttpStatus.OK);

        expect({ response: { body: response.body } }).toMatchSnapshot();
      });

      it('should refuse a request without a token with 401', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .get('/api/queues')
          .expect(HttpStatus.UNAUTHORIZED);

        expect({ response: { body: response.body } }).toMatchSnapshot();
      });
    });
  }

  public listFailedJobs(): void {
    describe('GET /api/queues/:queueName/jobs/failed', () => {
      it('should answer a page of the failed jobs as their JSON', async () => {
        const job = await this.ctx.ledgerRecordQueue.add(
          {
            operationKey: 'e2e-queue:1',
            subjectType: 'p'.repeat(65),
            subjectId: '200',
            action: 'ProductCreated',
            payload: {},
            occurredAt: '2026-01-06T08:00:00.000Z',
            correlationId: 'e2e-processor-queue-list',
          },
          { attempts: 1 },
        );

        await this.ctx.waitFor('the record to fail', () => job.isFailed());

        const response = await request(this.ctx.app.getHttpServer())
          .get('/api/queues/ledger-record/jobs/failed')
          .query({ page: 1, limit: 10 })
          .auth(this.ctx.viewerToken, { type: 'bearer' })
          .expect(HttpStatus.OK);

        expect({ response: { body: response.body } }).toMatchSnapshot({
          response: {
            body: {
              data: [
                {
                  id: expect.anything(),
                  opts: { timestamp: expect.any(Number) },
                  timestamp: expect.any(Number),
                  processedOn: expect.any(Number),
                  finishedOn: expect.any(Number),
                  stacktrace: [expect.any(String)],
                },
              ],
            },
          },
        });

        await job.remove();
      });

      it('should refuse an unknown queue with 404 QUEUE_NOT_FOUND', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .get('/api/queues/unknown/jobs/failed')
          .auth(this.ctx.viewerToken, { type: 'bearer' })
          .expect(HttpStatus.NOT_FOUND);

        expect({ response: { body: response.body } }).toMatchSnapshot();
      });

      it('should refuse a malformed page with 400 from validation', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .get('/api/queues/ledger-record/jobs/failed')
          .query({ page: 'first' })
          .auth(this.ctx.viewerToken, { type: 'bearer' })
          .expect(HttpStatus.BAD_REQUEST);

        expect({ response: { body: response.body } }).toMatchSnapshot();
      });
    });
  }

  public retryFailedJob(): void {
    describe('PUT /api/queues/:queueName/jobs/failed/:jobId', () => {
      it('should return a failed record to the queue and append it once its cause is gone', async () => {
        const job = await this.ctx.ledgerRecordQueue.add(
          {
            operationKey: 'e2e-queue:2',
            subjectType: 'p'.repeat(65),
            subjectId: '201',
            action: 'ProductArchived',
            payload: { sku: 'SKU-0004', previousStatus: 'active' },
            occurredAt: '2026-01-06T09:00:00.000Z',
            correlationId: 'e2e-processor-queue-retry',
          },
          { attempts: 1 },
        );

        await this.ctx.waitFor('the record to fail', () => job.isFailed());
        await job.update({ ...job.data, subjectType: 'product' });

        await request(this.ctx.app.getHttpServer())
          .put(`/api/queues/ledger-record/jobs/failed/${job.id}`)
          .auth(this.ctx.adminToken, { type: 'bearer' })
          .expect(HttpStatus.NO_CONTENT);

        await this.ctx.waitForLedgerRecordQueue();

        expect({
          db: {
            ledger_entry: await this.ctx.dataSource.query(
              'SELECT * FROM ledger_entry WHERE operation_key = ? ORDER BY id',
              ['e2e-queue:2'],
            ),
          },
          failed: await this.ctx.ledgerRecordQueue.getFailedCount(),
        }).toMatchSnapshot({
          db: { ledger_entry: [{ id: expect.any(String), recorded_at: expect.any(Date) }] },
        });
      });

      it('should refuse a job that is not failed with 409 QUEUE_JOB_NOT_FAILED', async () => {
        const job = await this.ctx.ledgerRecordQueue.add(
          {
            operationKey: 'e2e-queue:3',
            subjectType: 'product',
            subjectId: '202',
            action: 'ProductCreated',
            payload: {},
            occurredAt: '2026-01-06T10:00:00.000Z',
            correlationId: 'e2e-processor-queue-delayed',
          },
          { delay: 60000 },
        );

        const response = await request(this.ctx.app.getHttpServer())
          .put(`/api/queues/ledger-record/jobs/failed/${job.id}`)
          .auth(this.ctx.adminToken, { type: 'bearer' })
          .expect(HttpStatus.CONFLICT);

        await job.remove();

        expect({ response: { body: response.body } }).toMatchSnapshot({
          response: {
            body: {
              message: expect.stringMatching(
                /^Job \S+ of queue ledger-record is delayed, not failed$/,
              ),
            },
          },
        });
      });

      it('should refuse an unknown job with 404 QUEUE_JOB_NOT_FOUND', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .put('/api/queues/ledger-record/jobs/failed/999999')
          .auth(this.ctx.adminToken, { type: 'bearer' })
          .expect(HttpStatus.NOT_FOUND);

        expect({ response: { body: response.body } }).toMatchSnapshot();
      });

      it('should refuse an unknown queue with 404 QUEUE_NOT_FOUND', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .put('/api/queues/unknown/jobs/failed/1')
          .auth(this.ctx.adminToken, { type: 'bearer' })
          .expect(HttpStatus.NOT_FOUND);

        expect({ response: { body: response.body } }).toMatchSnapshot();
      });

      it('should refuse a user without queue:retry with 403', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .put('/api/queues/ledger-record/jobs/failed/1')
          .auth(this.ctx.viewerToken, { type: 'bearer' })
          .expect(HttpStatus.FORBIDDEN);

        expect({ response: { body: response.body } }).toMatchSnapshot();
      });
    });
  }

  public deleteFailedJob(): void {
    describe('DELETE /api/queues/:queueName/jobs/failed/:jobId', () => {
      it('should delete a failed job', async () => {
        const job = await this.ctx.ledgerRecordQueue.add(
          {
            operationKey: 'e2e-queue:4',
            subjectType: 'p'.repeat(65),
            subjectId: '203',
            action: 'ProductCreated',
            payload: {},
            occurredAt: '2026-01-06T11:00:00.000Z',
            correlationId: 'e2e-processor-queue-delete',
          },
          { attempts: 1 },
        );

        await this.ctx.waitFor('the record to fail', () => job.isFailed());

        await request(this.ctx.app.getHttpServer())
          .delete(`/api/queues/ledger-record/jobs/failed/${job.id}`)
          .auth(this.ctx.adminToken, { type: 'bearer' })
          .expect(HttpStatus.NO_CONTENT);

        expect({
          job: await this.ctx.ledgerRecordQueue.getJob(job.id),
          failed: await this.ctx.ledgerRecordQueue.getFailedCount(),
        }).toMatchSnapshot();
      });

      it('should refuse an unknown job with 404 QUEUE_JOB_NOT_FOUND', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .delete('/api/queues/ledger-record/jobs/failed/999999')
          .auth(this.ctx.adminToken, { type: 'bearer' })
          .expect(HttpStatus.NOT_FOUND);

        expect({ response: { body: response.body } }).toMatchSnapshot();
      });

      it('should refuse a user without queue:delete with 403', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .delete('/api/queues/ledger-record/jobs/failed/1')
          .auth(this.ctx.viewerToken, { type: 'bearer' })
          .expect(HttpStatus.FORBIDDEN);

        expect({ response: { body: response.body } }).toMatchSnapshot();
      });
    });
  }
}
