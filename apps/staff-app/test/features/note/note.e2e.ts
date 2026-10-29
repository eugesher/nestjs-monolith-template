import { HttpStatus } from '@nestjs/common';
import request from 'supertest';

import { AppE2EContext } from '../../context/app-e2e.context';

export class NoteE2E {
  private constructor(private readonly ctx: AppE2EContext) {}

  public static of(ctx: AppE2EContext): NoteE2E {
    return new NoteE2E(ctx);
  }

  public handleGetMany(): void {
    describe('GET /api/notes', () => {
      it('should list the notes of one subject, newest first', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .get('/api/notes')
          .query({ subjectType: 'product', subjectId: '100' })
          .auth(this.ctx.editorToken, { type: 'bearer' })
          .expect(HttpStatus.OK);

        expect({ response: { body: response.body } }).toMatchSnapshot();
      });

      it('should filter by resolution', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .get('/api/notes')
          .query({ resolved: 'true' })
          .auth(this.ctx.editorToken, { type: 'bearer' })
          .expect(HttpStatus.OK);

        expect({ response: { body: response.body } }).toMatchSnapshot();
      });

      it('should refuse half of a subject filter with 400', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .get('/api/notes')
          .query({ subjectType: 'product' })
          .auth(this.ctx.editorToken, { type: 'bearer' })
          .expect(HttpStatus.BAD_REQUEST);

        expect({ response: { body: response.body } }).toMatchSnapshot();
      });

      it('should refuse a resolution that is not a boolean with 400 from validation', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .get('/api/notes')
          .query({ resolved: 'yes' })
          .auth(this.ctx.editorToken, { type: 'bearer' })
          .expect(HttpStatus.BAD_REQUEST);

        expect({ response: { body: response.body } }).toMatchSnapshot();
      });

      it('should refuse a caller without note:read', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .get('/api/notes')
          .auth(this.ctx.viewerToken, { type: 'bearer' })
          .expect(HttpStatus.FORBIDDEN);

        expect({ response: { body: response.body } }).toMatchSnapshot();
      });
    });
  }

  public handleGetOne(): void {
    describe('GET /api/notes/:noteId', () => {
      it('should read one note', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .get('/api/notes/202')
          .auth(this.ctx.editorToken, { type: 'bearer' })
          .expect(HttpStatus.OK);

        expect({ response: { body: response.body } }).toMatchSnapshot();
      });

      it('should answer 404 for a missing note', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .get('/api/notes/299')
          .auth(this.ctx.editorToken, { type: 'bearer' })
          .expect(HttpStatus.NOT_FOUND);

        expect({ response: { body: response.body } }).toMatchSnapshot();
      });

      it('should refuse an id that is not a number with 400 from validation', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .get('/api/notes/abc')
          .auth(this.ctx.editorToken, { type: 'bearer' })
          .expect(HttpStatus.BAD_REQUEST);

        expect({ response: { body: response.body } }).toMatchSnapshot();
      });
    });
  }

  public handleGetRevisions(): void {
    describe('GET /api/notes/:noteId/revisions', () => {
      it('should list the revisions of a note', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .get('/api/notes/202/revisions')
          .auth(this.ctx.editorToken, { type: 'bearer' })
          .expect(HttpStatus.OK);

        expect({ response: { body: response.body } }).toMatchSnapshot();
      });

      it('should answer 404 for the revisions of a missing note', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .get('/api/notes/299/revisions')
          .auth(this.ctx.editorToken, { type: 'bearer' })
          .expect(HttpStatus.NOT_FOUND);

        expect({ response: { body: response.body } }).toMatchSnapshot();
      });
    });
  }

  public handleCreate(): void {
    describe('POST /api/notes', () => {
      it('should create an unresolved note on an opaque subject', async () => {
        const [{ lastId }] = await this.ctx.dataSource.query('SELECT MAX(id) AS lastId FROM note');

        const response = await request(this.ctx.app.getHttpServer())
          .post('/api/notes')
          .auth(this.ctx.editorToken, { type: 'bearer' })
          .send({ subjectType: 'support-ticket', subjectId: 'T-900', body: 'Customer called.' })
          .expect(HttpStatus.CREATED);

        const actual = {
          response: { body: response.body },
          db: {
            note: await this.ctx.dataSource.query('SELECT * FROM note WHERE id > ? ORDER BY id', [
              lastId,
            ]),
          },
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
            note: [
              {
                id: expect.any(String),
                created_at: expect.any(Date),
                updated_at: expect.any(Date),
              },
            ],
          },
        });
        expect(actual).toMatchObject({ db: { note: [{ id: response.body.id }] } });
        expect(Number(response.body.id)).toBeGreaterThan(Number(lastId));
      });
    });
  }

  public handleEdit(): void {
    describe('PATCH /api/notes/:noteId', () => {
      it('should rewrite the body and record a revision under the correlation id', async () => {
        const [{ lastId }] = await this.ctx.dataSource.query(
          'SELECT MAX(id) AS lastId FROM note_revision',
        );

        const response = await request(this.ctx.app.getHttpServer())
          .patch('/api/notes/200')
          .set('x-correlation-id', 'e2e-note-edit')
          .auth(this.ctx.editorToken, { type: 'bearer' })
          .send({ body: 'Customer called twice; refunded manually.' })
          .expect(HttpStatus.OK);

        const actual = {
          response: { body: response.body },
          db: {
            note: await this.ctx.dataSource.query('SELECT * FROM note WHERE id = 200'),
            note_revision: await this.ctx.dataSource.query(
              'SELECT * FROM note_revision WHERE note_id = 200 ORDER BY id',
            ),
          },
        };

        expect(actual).toMatchSnapshot({
          response: { body: { updatedAt: expect.any(String) } },
          db: {
            note: [{ updated_at: expect.any(Date) }],
            note_revision: [{ id: expect.any(String), recorded_at: expect.any(Date) }],
          },
        });
        expect(Number(actual.db.note_revision[0].id)).toBeGreaterThan(Number(lastId));
      });

      it('should write nothing for an edit to the current body', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .patch('/api/notes/204')
          .auth(this.ctx.editorToken, { type: 'bearer' })
          .send({ body: 'Edited with the same body.' })
          .expect(HttpStatus.OK);

        expect({
          response: { body: response.body },
          db: {
            note: await this.ctx.dataSource.query('SELECT * FROM note WHERE id = 204'),
            note_revision: await this.ctx.dataSource.query(
              'SELECT * FROM note_revision WHERE note_id = 204 ORDER BY id',
            ),
          },
        }).toMatchSnapshot();
      });

      it('should roll the note back when the revision insert fails', async () => {
        await this.ctx.dataSource.query(
          'INSERT INTO note_revision (id, note_id, note_version, body_before, body_after, editor_id) VALUES (299, 203, 2, ?, ?, ?)',
          ['Taken before.', 'Taken after.', '00000000-0000-4000-8000-000000000001'],
        );

        try {
          const response = await request(this.ctx.app.getHttpServer())
            .patch('/api/notes/203')
            .auth(this.ctx.editorToken, { type: 'bearer' })
            .send({ body: 'This edit is rolled back.' })
            .expect(HttpStatus.CONFLICT);

          expect({
            response: { body: response.body },
            db: {
              note: await this.ctx.dataSource.query('SELECT * FROM note WHERE id = 203'),
              note_revision: await this.ctx.dataSource.query(
                'SELECT id, note_id, note_version, body_after FROM note_revision WHERE note_id = 203 ORDER BY id',
              ),
            },
          }).toMatchSnapshot();
        } finally {
          await this.ctx.dataSource.query('DELETE FROM note_revision WHERE id = 299');
        }
      });

      it('should refuse to edit a resolved note with 409', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .patch('/api/notes/202')
          .auth(this.ctx.editorToken, { type: 'bearer' })
          .send({ body: 'Too late.' })
          .expect(HttpStatus.CONFLICT);

        expect({
          response: { body: response.body },
          db: {
            note: await this.ctx.dataSource.query('SELECT * FROM note WHERE id = 202'),
            note_revision: await this.ctx.dataSource.query(
              'SELECT * FROM note_revision WHERE note_id = 202 ORDER BY id',
            ),
          },
        }).toMatchSnapshot();
      });
    });
  }

  public handleResolve(): void {
    describe('PATCH /api/notes/:noteId/resolve', () => {
      it('should resolve a note', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .patch('/api/notes/201/resolve')
          .auth(this.ctx.editorToken, { type: 'bearer' })
          .expect(HttpStatus.OK);

        expect({
          response: { body: response.body },
          db: { note: await this.ctx.dataSource.query('SELECT * FROM note WHERE id = 201') },
        }).toMatchSnapshot({
          response: { body: { updatedAt: expect.any(String) } },
          db: { note: [{ updated_at: expect.any(Date) }] },
        });
      });

      it('should refuse to resolve a resolved note with 409', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .patch('/api/notes/202/resolve')
          .auth(this.ctx.editorToken, { type: 'bearer' })
          .expect(HttpStatus.CONFLICT);

        expect({
          response: { body: response.body },
          db: { note: await this.ctx.dataSource.query('SELECT * FROM note WHERE id = 202') },
        }).toMatchSnapshot();
      });
    });
  }
}
