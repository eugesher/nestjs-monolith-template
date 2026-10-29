import { NoteModel } from '../note.model';

describe('NoteModel', () => {
  describe('create', () => {
    it('opens an unresolved note at version 1 with a trimmed subject id and body', () => {
      const note = NoteModel.create({
        subjectType: 'product',
        subjectId: '  42  ',
        body: '  Check the supplier  ',
        authorId: 'admin-1',
      });

      expect(note.id).toBeUndefined();
      expect(note.subjectType).toBe('product');
      expect(note.subjectId).toBe('42');
      expect(note.body).toBe('Check the supplier');
      expect(note.authorId).toBe('admin-1');
      expect(note.resolved).toBe(false);
      expect(note.version).toBe(1);
      expect(note.createdAt).toBeUndefined();
      expect(note.updatedAt).toBeUndefined();
      expect(note.pullDomainEvents()).toEqual([]);
    });

    it('accepts any subject the pattern allows, without checking it exists', () => {
      const note = NoteModel.create({
        subjectType: 'support-ticket',
        subjectId: 'TCK-0001',
        body: 'Escalated',
        authorId: 'admin-1',
      });

      expect(note.subjectType).toBe('support-ticket');
      expect(note.subjectId).toBe('TCK-0001');
    });

    it.each([
      ['a capital letter', 'Product'],
      ['a single letter', 'i'],
      ['a leading dash', '-product'],
      ['a digit', 'product2'],
      ['65 characters', `i${'t'.repeat(64)}`],
    ])('refuses a subject type with %s with NOTE_SUBJECT_INVALID', (_, subjectType) => {
      expect(() =>
        NoteModel.create({ subjectType, subjectId: '42', body: 'Body', authorId: 'admin-1' }),
      ).toThrow(
        expect.objectContaining({
          code: 'NOTE_SUBJECT_INVALID',
          message: `Note.subjectType must match /^[a-z][a-z-]{1,63}$/, got ${subjectType}`,
        }) as Error,
      );
    });

    it('accepts a subject type of 64 characters and a subject id of 64', () => {
      const note = NoteModel.create({
        subjectType: `i${'t'.repeat(63)}`,
        subjectId: 's'.repeat(64),
        body: 'Body',
        authorId: 'admin-1',
      });

      expect(note.subjectType).toHaveLength(64);
      expect(note.subjectId).toHaveLength(64);
    });

    it.each([
      ['a blank subject id', '   '],
      ['a subject id longer than 64', 's'.repeat(65)],
    ])('refuses %s with NOTE_SUBJECT_INVALID', (_, subjectId) => {
      expect(() =>
        NoteModel.create({ subjectType: 'product', subjectId, body: 'Body', authorId: 'admin-1' }),
      ).toThrow(
        expect.objectContaining({
          code: 'NOTE_SUBJECT_INVALID',
          message: 'Note.subjectId must be a non-empty string of at most 64 characters',
        }) as Error,
      );
    });

    it('accepts a body of 4000 characters', () => {
      const note = NoteModel.create({
        subjectType: 'product',
        subjectId: '42',
        body: 'b'.repeat(4000),
        authorId: 'admin-1',
      });

      expect(note.body).toHaveLength(4000);
    });

    it.each([
      ['a blank body', '   '],
      ['a body longer than 4000', 'b'.repeat(4001)],
    ])('refuses %s with NOTE_BODY_INVALID', (_, body) => {
      expect(() =>
        NoteModel.create({ subjectType: 'product', subjectId: '42', body, authorId: 'admin-1' }),
      ).toThrow(
        expect.objectContaining({
          code: 'NOTE_BODY_INVALID',
          message: 'Note.body must be a non-empty string of at most 4000 characters',
        }) as Error,
      );
    });
  });

  describe('reconstitute', () => {
    it('restores a stored note as it was', () => {
      const note = NoteModel.reconstitute({
        id: '7',
        subjectType: 'product',
        subjectId: '42',
        body: 'Check the supplier',
        authorId: 'admin-1',
        resolved: true,
        version: 3,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-02T00:00:00.000Z'),
      });

      expect(note.id).toBe('7');
      expect(note.resolved).toBe(true);
      expect(note.version).toBe(3);
      expect(note.createdAt).toEqual(new Date('2026-01-01T00:00:00.000Z'));
      expect(note.updatedAt).toEqual(new Date('2026-01-02T00:00:00.000Z'));
    });

    it.each([0, 1.5])('refuses version %s with NOTE_VERSION_INVALID', (version) => {
      expect(() =>
        NoteModel.reconstitute({
          id: '7',
          subjectType: 'product',
          subjectId: '42',
          body: 'Check the supplier',
          authorId: 'admin-1',
          resolved: false,
          version,
          createdAt: new Date('2026-01-01T00:00:00.000Z'),
          updatedAt: new Date('2026-01-01T00:00:00.000Z'),
        }),
      ).toThrow(
        expect.objectContaining({
          code: 'NOTE_VERSION_INVALID',
          message: `Note.version must be a positive integer, got ${version}`,
        }) as Error,
      );
    });
  });

  describe('edit', () => {
    let note: NoteModel;

    beforeEach(() => {
      note = NoteModel.reconstitute({
        id: '7',
        subjectType: 'product',
        subjectId: '42',
        body: 'Check the supplier',
        authorId: 'admin-1',
        resolved: false,
        version: 2,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      });
    });

    it('replaces the body with the trimmed one and bumps the version', () => {
      note.edit('  Supplier confirmed  ');

      expect(note.body).toBe('Supplier confirmed');
      expect(note.version).toBe(3);
    });

    it('changes nothing when the trimmed body is the current one', () => {
      note.edit('  Check the supplier ');

      expect(note.body).toBe('Check the supplier');
      expect(note.version).toBe(2);
    });

    it('refuses a blank body with NOTE_BODY_INVALID and keeps the note', () => {
      expect(() => note.edit('   ')).toThrow(
        expect.objectContaining({ code: 'NOTE_BODY_INVALID' }) as Error,
      );
      expect(note.body).toBe('Check the supplier');
      expect(note.version).toBe(2);
    });

    it('refuses a resolved note with NOTE_RESOLVED', () => {
      note.resolve();

      expect(() => note.edit('Supplier confirmed')).toThrow(
        expect.objectContaining({
          code: 'NOTE_RESOLVED',
          message: 'Note 7 is resolved and can no longer be modified',
        }) as Error,
      );
      expect(note.version).toBe(3);
    });
  });

  describe('resolve', () => {
    it('resolves the note and bumps the version', () => {
      const note = NoteModel.reconstitute({
        id: '7',
        subjectType: 'product',
        subjectId: '42',
        body: 'Check the supplier',
        authorId: 'admin-1',
        resolved: false,
        version: 2,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      });

      note.resolve();

      expect(note.resolved).toBe(true);
      expect(note.version).toBe(3);
    });

    it('refuses a resolved note with NOTE_RESOLVED', () => {
      const note = NoteModel.reconstitute({
        id: '7',
        subjectType: 'product',
        subjectId: '42',
        body: 'Check the supplier',
        authorId: 'admin-1',
        resolved: true,
        version: 3,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      });

      expect(() => note.resolve()).toThrow(
        expect.objectContaining({ code: 'NOTE_RESOLVED' }) as Error,
      );
      expect(note.version).toBe(3);
    });
  });
});
