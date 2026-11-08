import { HttpStatus } from '@nestjs/common';
import request from 'supertest';

import { AppE2EContext } from '../../../context/app-e2e.context';

export class TagE2E {
  private constructor(private readonly ctx: AppE2EContext) {}

  public static of(ctx: AppE2EContext): TagE2E {
    return new TagE2E(ctx);
  }

  public handleGetMany(): void {
    describe('GET /api/tools/tags', () => {
      it('should list the tags by name', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .get('/api/tools/tags')
          .auth(this.ctx.viewerToken, { type: 'bearer' })
          .expect(HttpStatus.OK);

        expect({ response: { body: response.body } }).toMatchSnapshot();
      });

      it('should answer the page window it was asked for', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .get('/api/tools/tags')
          .query({ page: 2, limit: 2 })
          .auth(this.ctx.viewerToken, { type: 'bearer' })
          .expect(HttpStatus.OK);

        expect({ response: { body: response.body } }).toMatchSnapshot();
      });

      it('should refuse a role without tag:read with 403', async () => {
        try {
          await this.ctx.dataSource.query(
            "DELETE FROM staff_role_permissions WHERE role_id = 3 AND code = 'tag:read'",
          );

          const response = await request(this.ctx.app.getHttpServer())
            .get('/api/tools/tags')
            .auth(this.ctx.viewerToken, { type: 'bearer' })
            .expect(HttpStatus.FORBIDDEN);

          expect({ response: { body: response.body } }).toMatchSnapshot();
        } finally {
          await this.ctx.dataSource.query(
            "INSERT INTO staff_role_permissions (role_id, code) VALUES (3, 'tag:read')",
          );
        }
      });
    });
  }

  public handleCreate(): void {
    describe('POST /api/tools/tags', () => {
      it('should create a tag with the trimmed name', async () => {
        try {
          const response = await request(this.ctx.app.getHttpServer())
            .post('/api/tools/tags')
            .auth(this.ctx.editorToken, { type: 'bearer' })
            .send({ name: '  heavy  ' })
            .expect(HttpStatus.CREATED);

          const actual = {
            response: { body: response.body },
            db: {
              tag: await this.ctx.dataSource.query('SELECT * FROM tag WHERE id = ?', [
                response.body.id,
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
              tag: [
                {
                  id: expect.any(String),
                  created_at: expect.any(Date),
                  updated_at: expect.any(Date),
                },
              ],
            },
          });
        } finally {
          await this.ctx.dataSource.query("DELETE FROM tag WHERE name = 'heavy'");
        }
      });

      it('should refuse a name that differs from a taken one only in case with 409', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .post('/api/tools/tags')
          .auth(this.ctx.editorToken, { type: 'bearer' })
          .send({ name: 'Fragile' })
          .expect(HttpStatus.CONFLICT);

        expect({ response: { body: response.body } }).toMatchSnapshot();
      });

      it('should refuse a name of spaces with 400 from the domain', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .post('/api/tools/tags')
          .auth(this.ctx.editorToken, { type: 'bearer' })
          .send({ name: '   ' })
          .expect(HttpStatus.BAD_REQUEST);

        expect({ response: { body: response.body } }).toMatchSnapshot();
      });

      it('should refuse a missing name with 400 from validation', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .post('/api/tools/tags')
          .auth(this.ctx.editorToken, { type: 'bearer' })
          .send({})
          .expect(HttpStatus.BAD_REQUEST);

        expect({ response: { body: response.body } }).toMatchSnapshot();
      });

      it('should refuse a role without tag:write with 403', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .post('/api/tools/tags')
          .auth(this.ctx.viewerToken, { type: 'bearer' })
          .send({ name: 'heavy' })
          .expect(HttpStatus.FORBIDDEN);

        expect({ response: { body: response.body } }).toMatchSnapshot();
      });
    });
  }

  public handleRename(): void {
    describe('PATCH /api/tools/tags/:tagId', () => {
      beforeEach(async () => {
        await this.ctx.dataSource.query(
          "INSERT INTO tag (id, name, created_at, updated_at) VALUES (390, 'seasonal', '2026-01-01 00:00:00', '2026-01-01 00:00:00')",
        );
      });

      afterEach(async () => {
        await this.ctx.dataSource.query('DELETE FROM tag WHERE id = 390');
      });

      it('should rename the tag', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .patch('/api/tools/tags/390')
          .auth(this.ctx.editorToken, { type: 'bearer' })
          .send({ name: 'winter' })
          .expect(HttpStatus.OK);

        const actual = {
          response: { body: response.body },
          db: { tag: await this.ctx.dataSource.query('SELECT * FROM tag WHERE id = 390') },
        };

        expect(actual).toMatchSnapshot({
          response: { body: { updatedAt: expect.any(String) } },
          db: { tag: [{ updated_at: expect.any(Date) }] },
        });
      });

      it('should answer the tag as it is when the name does not change', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .patch('/api/tools/tags/390')
          .auth(this.ctx.editorToken, { type: 'bearer' })
          .send({ name: 'seasonal' })
          .expect(HttpStatus.OK);

        expect({ response: { body: response.body } }).toMatchSnapshot();
      });

      it('should refuse the name of another tag with 409', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .patch('/api/tools/tags/390')
          .auth(this.ctx.editorToken, { type: 'bearer' })
          .send({ name: 'vip' })
          .expect(HttpStatus.CONFLICT);

        expect({ response: { body: response.body } }).toMatchSnapshot();
      });

      it('should answer an unknown tag with 404', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .patch('/api/tools/tags/999')
          .auth(this.ctx.editorToken, { type: 'bearer' })
          .send({ name: 'winter' })
          .expect(HttpStatus.NOT_FOUND);

        expect({ response: { body: response.body } }).toMatchSnapshot();
      });

      it('should refuse a malformed tag id with 400 from validation', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .patch('/api/tools/tags/abc')
          .auth(this.ctx.editorToken, { type: 'bearer' })
          .send({ name: 'winter' })
          .expect(HttpStatus.BAD_REQUEST);

        expect({ response: { body: response.body } }).toMatchSnapshot();
      });
    });
  }

  public handleDelete(): void {
    describe('DELETE /api/tools/tags/:tagId', () => {
      it('should delete the tag and unlink it from every subject', async () => {
        try {
          await this.ctx.dataSource.query(
            "INSERT INTO tag (id, name, created_at, updated_at) VALUES (391, 'clearance', '2026-01-01 00:00:00', '2026-01-01 00:00:00')",
          );
          await this.ctx.dataSource.query(
            "INSERT INTO subject_tag (id, subject_type, subject_id, tag_id, created_at) VALUES (491, 'product', 102, 391, '2026-01-01 00:00:00'), (492, 'order', 601, 391, '2026-01-01 00:00:00')",
          );

          await request(this.ctx.app.getHttpServer())
            .delete('/api/tools/tags/391')
            .auth(this.ctx.editorToken, { type: 'bearer' })
            .expect(HttpStatus.NO_CONTENT);

          expect({
            db: {
              tag: await this.ctx.dataSource.query('SELECT * FROM tag WHERE id = 391'),
              subject_tag: await this.ctx.dataSource.query(
                'SELECT * FROM subject_tag WHERE tag_id = 391',
              ),
            },
          }).toEqual({ db: { tag: [], subject_tag: [] } });
        } finally {
          await this.ctx.dataSource.query('DELETE FROM subject_tag WHERE id IN (491, 492)');
          await this.ctx.dataSource.query('DELETE FROM tag WHERE id = 391');
        }
      });

      it('should answer an unknown tag with 404', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .delete('/api/tools/tags/999')
          .auth(this.ctx.editorToken, { type: 'bearer' })
          .expect(HttpStatus.NOT_FOUND);

        expect({ response: { body: response.body } }).toMatchSnapshot();
      });

      it('should refuse a role without tag:write with 403', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .delete('/api/tools/tags/300')
          .auth(this.ctx.viewerToken, { type: 'bearer' })
          .expect(HttpStatus.FORBIDDEN);

        expect({ response: { body: response.body } }).toMatchSnapshot();
      });
    });
  }
}
