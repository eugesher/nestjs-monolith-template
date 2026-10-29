import {
  NoteCreateUseCase,
  NoteEditUseCase,
  NoteGetManyUseCase,
  NoteGetOneUseCase,
  NoteGetRevisionsUseCase,
  NoteResolveUseCase,
} from '../../../application';
import { NoteController } from '../note.controller';

describe('NoteController', () => {
  let create: jest.Mock;
  let getMany: jest.Mock;
  let getOne: jest.Mock;
  let edit: jest.Mock;
  let resolve: jest.Mock;
  let getRevisions: jest.Mock;
  let controller: NoteController;

  beforeEach(() => {
    create = jest.fn();
    getMany = jest.fn();
    getOne = jest.fn();
    edit = jest.fn();
    resolve = jest.fn();
    getRevisions = jest.fn();

    controller = new NoteController(
      { execute: create } as unknown as NoteCreateUseCase,
      { execute: getMany } as unknown as NoteGetManyUseCase,
      { execute: getOne } as unknown as NoteGetOneUseCase,
      { execute: edit } as unknown as NoteEditUseCase,
      { execute: resolve } as unknown as NoteResolveUseCase,
      { execute: getRevisions } as unknown as NoteGetRevisionsUseCase,
    );
  });

  describe('handleCreate', () => {
    it('creates the note of the body with the caller as its author', async () => {
      create.mockResolvedValue({ id: '17', body: 'Refunded' });

      const response = await controller.handleCreate(
        { subjectType: 'item', subjectId: '42', body: 'Refunded' },
        { id: 'user-1', email: 'ann@example.com' },
      );

      expect(response).toEqual({ id: '17', body: 'Refunded' });
      expect(create).toHaveBeenCalledWith({
        subjectType: 'item',
        subjectId: '42',
        body: 'Refunded',
        authorId: 'user-1',
      });
    });
  });

  describe('handleGetMany', () => {
    it('lists the notes of the query', async () => {
      getMany.mockResolvedValue({ items: [], total: 0, page: 2, size: 5 });

      const response = await controller.handleGetMany({
        page: 2,
        size: 5,
        subjectType: 'item',
        subjectId: '42',
        resolved: false,
      });

      expect(response).toEqual({ items: [], total: 0, page: 2, size: 5 });
      expect(getMany).toHaveBeenCalledWith({
        page: 2,
        size: 5,
        subjectType: 'item',
        subjectId: '42',
        resolved: false,
      });
    });
  });

  describe('handleGetOne', () => {
    it('reads the note of the path', async () => {
      getOne.mockResolvedValue({ id: '17' });

      const response = await controller.handleGetOne({ noteId: '17' });

      expect(response).toEqual({ id: '17' });
      expect(getOne).toHaveBeenCalledWith({ noteId: '17' });
    });
  });

  describe('handleEdit', () => {
    it('edits the note of the path with the body of the request and the caller as editor', async () => {
      edit.mockResolvedValue({ id: '17', version: 2 });

      const response = await controller.handleEdit(
        { noteId: '17' },
        { body: 'Refunded twice' },
        { id: 'user-1', email: 'ann@example.com' },
      );

      expect(response).toEqual({ id: '17', version: 2 });
      expect(edit).toHaveBeenCalledWith({
        noteId: '17',
        body: 'Refunded twice',
        editorId: 'user-1',
      });
    });
  });

  describe('handleResolve', () => {
    it('resolves the note of the path', async () => {
      resolve.mockResolvedValue({ id: '17', resolved: true });

      const response = await controller.handleResolve({ noteId: '17' });

      expect(response).toEqual({ id: '17', resolved: true });
      expect(resolve).toHaveBeenCalledWith({ noteId: '17' });
    });
  });

  describe('handleGetRevisions', () => {
    it('lists the revisions of the note of the path', async () => {
      getRevisions.mockResolvedValue({ items: [], total: 0, page: 1, size: 20 });

      const response = await controller.handleGetRevisions({ noteId: '17' }, { page: 1, size: 20 });

      expect(response).toEqual({ items: [], total: 0, page: 1, size: 20 });
      expect(getRevisions).toHaveBeenCalledWith({ noteId: '17', page: 1, size: 20 });
    });
  });
});
