import { HttpStatus } from '@nestjs/common';
import request from 'supertest';

import { AppE2EContext } from '../../context/app-e2e.context';

export class ReminderE2E {
  private constructor(private readonly ctx: AppE2EContext) {}

  public static of(ctx: AppE2EContext): ReminderE2E {
    return new ReminderE2E(ctx);
  }

  public hooks(): void {
    beforeEach(async () => {
      await this.ctx.redis.flushdb();
    });
  }

  public handleGetSummary(): void {
    describe('GET /api/reminders/summary', () => {
      it('should compute the summary of the caller and cache it', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .get('/api/reminders/summary')
          .auth(this.ctx.viewerToken, { type: 'bearer' })
          .expect(HttpStatus.OK);

        const key = 'acme:reminders:summary:v1:00000000-0000-4000-8000-000000000003:__all__';

        expect({
          response: { body: response.body },
          cache: {
            keys: await this.ctx.redis.keys('*'),
            values: { [key]: await this.ctx.redis.get(key) },
          },
        }).toMatchSnapshot();
        expect(await this.ctx.redis.pttl(key)).toBeGreaterThan(55_000);
        expect(await this.ctx.redis.pttl(key)).toBeLessThanOrEqual(60_000);
      });

      it('should answer the cached summary', async () => {
        await this.ctx.redis.set(
          'acme:reminders:summary:v1:00000000-0000-4000-8000-000000000003:__all__',
          JSON.stringify({ pending: 99, nextDueOn: '2030-01-01' }),
          'PX',
          60_000,
        );

        const response = await request(this.ctx.app.getHttpServer())
          .get('/api/reminders/summary')
          .auth(this.ctx.viewerToken, { type: 'bearer' })
          .expect(HttpStatus.OK);

        expect({ response: { body: response.body } }).toMatchSnapshot();
      });
    });
  }

  public handleGetMany(): void {
    describe('GET /api/reminders', () => {
      it('should list the own reminders of the caller, soonest first, without deleted ones', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .get('/api/reminders')
          .auth(this.ctx.viewerToken, { type: 'bearer' })
          .expect(HttpStatus.OK);

        expect({ response: { body: response.body } }).toMatchSnapshot();
      });

      it('should filter by status', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .get('/api/reminders')
          .query({ status: 'done' })
          .auth(this.ctx.viewerToken, { type: 'bearer' })
          .expect(HttpStatus.OK);

        expect({ response: { body: response.body } }).toMatchSnapshot();
      });
    });
  }

  public handleCreate(): void {
    describe('POST /api/reminders', () => {
      it('should create a pending reminder on the date sent and drop the cached summary', async () => {
        await request(this.ctx.app.getHttpServer())
          .get('/api/reminders/summary')
          .auth(this.ctx.viewerToken, { type: 'bearer' })
          .expect(HttpStatus.OK);

        const [{ lastId }] = await this.ctx.dataSource.query(
          'SELECT MAX(id) AS lastId FROM reminder',
        );

        const response = await request(this.ctx.app.getHttpServer())
          .post('/api/reminders')
          .auth(this.ctx.viewerToken, { type: 'bearer' })
          .send({ title: 'Renew the domain', dueOn: '2026-06-01' })
          .expect(HttpStatus.CREATED);

        const actual = {
          response: { body: response.body },
          db: {
            reminder: await this.ctx.dataSource.query(
              'SELECT * FROM reminder WHERE id > ? ORDER BY id',
              [lastId],
            ),
          },
          cache: { keys: await this.ctx.redis.keys('*') },
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
            reminder: [
              {
                id: expect.any(String),
                created_at: expect.any(Date),
                updated_at: expect.any(Date),
              },
            ],
          },
        });
        expect(actual).toMatchObject({ db: { reminder: [{ id: response.body.id }] } });
        expect(Number(response.body.id)).toBeGreaterThan(Number(lastId));
      });

      it('should refuse an instant with 400 from validation', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .post('/api/reminders')
          .auth(this.ctx.viewerToken, { type: 'bearer' })
          .send({ title: 'Wrong shape', dueOn: '2026-06-01T00:00:00Z' })
          .expect(HttpStatus.BAD_REQUEST);

        expect({ response: { body: response.body } }).toMatchSnapshot();
      });

      it('should refuse a date that does not exist with 400 from the model', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .post('/api/reminders')
          .auth(this.ctx.viewerToken, { type: 'bearer' })
          .send({ title: 'Not a day', dueOn: '2026-02-30' })
          .expect(HttpStatus.BAD_REQUEST);

        expect({ response: { body: response.body } }).toMatchSnapshot();
      });
    });
  }

  public handleComplete(): void {
    describe('PATCH /api/reminders/:reminderId/done', () => {
      it('should complete a reminder and drop the cached summary', async () => {
        await request(this.ctx.app.getHttpServer())
          .get('/api/reminders/summary')
          .auth(this.ctx.viewerToken, { type: 'bearer' })
          .expect(HttpStatus.OK);

        const response = await request(this.ctx.app.getHttpServer())
          .patch('/api/reminders/301/done')
          .auth(this.ctx.viewerToken, { type: 'bearer' })
          .expect(HttpStatus.OK);

        expect({
          response: { body: response.body },
          db: {
            reminder: await this.ctx.dataSource.query('SELECT * FROM reminder WHERE id = 301'),
          },
          cache: { keys: await this.ctx.redis.keys('*') },
        }).toMatchSnapshot({
          response: { body: { updatedAt: expect.any(String) } },
          db: { reminder: [{ updated_at: expect.any(Date) }] },
        });
      });

      it('should refuse the reminder of another owner with 403', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .patch('/api/reminders/300/done')
          .auth(this.ctx.editorToken, { type: 'bearer' })
          .expect(HttpStatus.FORBIDDEN);

        expect({
          response: { body: response.body },
          db: {
            reminder: await this.ctx.dataSource.query('SELECT * FROM reminder WHERE id = 300'),
          },
        }).toMatchSnapshot();
      });

      it('should refuse a done reminder with 409', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .patch('/api/reminders/302/done')
          .auth(this.ctx.viewerToken, { type: 'bearer' })
          .expect(HttpStatus.CONFLICT);

        expect({ response: { body: response.body } }).toMatchSnapshot();
      });

      it('should answer 404 for a deleted reminder', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .patch('/api/reminders/306/done')
          .auth(this.ctx.viewerToken, { type: 'bearer' })
          .expect(HttpStatus.NOT_FOUND);

        expect({ response: { body: response.body } }).toMatchSnapshot();
      });

      it('should refuse an id that is not a number with 400 from validation', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .patch('/api/reminders/abc/done')
          .auth(this.ctx.viewerToken, { type: 'bearer' })
          .expect(HttpStatus.BAD_REQUEST);

        expect({ response: { body: response.body } }).toMatchSnapshot();
      });
    });
  }

  public handleReschedule(): void {
    describe('PATCH /api/reminders/:reminderId/due-on', () => {
      it('should move a reminder to the date sent and drop the cached summary', async () => {
        await request(this.ctx.app.getHttpServer())
          .get('/api/reminders/summary')
          .auth(this.ctx.viewerToken, { type: 'bearer' })
          .expect(HttpStatus.OK);

        const response = await request(this.ctx.app.getHttpServer())
          .patch('/api/reminders/305/due-on')
          .auth(this.ctx.viewerToken, { type: 'bearer' })
          .send({ dueOn: '2026-10-01' })
          .expect(HttpStatus.OK);

        expect({
          response: { body: response.body },
          db: {
            reminder: await this.ctx.dataSource.query('SELECT * FROM reminder WHERE id = 305'),
          },
          cache: { keys: await this.ctx.redis.keys('*') },
        }).toMatchSnapshot({
          response: { body: { updatedAt: expect.any(String) } },
          db: { reminder: [{ updated_at: expect.any(Date) }] },
        });
      });
    });
  }

  public handleDelete(): void {
    describe('DELETE /api/reminders/:reminderId', () => {
      it('should soft-delete a reminder and drop the cached summary', async () => {
        await request(this.ctx.app.getHttpServer())
          .get('/api/reminders/summary')
          .auth(this.ctx.viewerToken, { type: 'bearer' })
          .expect(HttpStatus.OK);

        const response = await request(this.ctx.app.getHttpServer())
          .delete('/api/reminders/304')
          .auth(this.ctx.viewerToken, { type: 'bearer' })
          .expect(HttpStatus.NO_CONTENT);

        expect({
          response: { body: response.body },
          db: {
            reminder: await this.ctx.dataSource.query('SELECT * FROM reminder WHERE id = 304'),
          },
          cache: { keys: await this.ctx.redis.keys('*') },
        }).toMatchSnapshot({
          db: { reminder: [{ updated_at: expect.any(Date), deleted_at: expect.any(Date) }] },
        });
      });
    });
  }
}
