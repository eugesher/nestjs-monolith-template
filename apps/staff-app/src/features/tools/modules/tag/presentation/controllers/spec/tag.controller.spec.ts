import { TagController } from '../tag.controller';
import type {
  TagCreateUseCase,
  TagDeleteUseCase,
  TagGetManyUseCase,
  TagRenameUseCase,
} from '../../../application';

describe('TagController', () => {
  let create: jest.Mock;
  let getMany: jest.Mock;
  let rename: jest.Mock;
  let remove: jest.Mock;
  let controller: TagController;

  beforeEach(() => {
    create = jest.fn();
    getMany = jest.fn();
    rename = jest.fn();
    remove = jest.fn();

    controller = new TagController(
      { execute: create } as unknown as TagCreateUseCase,
      { execute: getMany } as unknown as TagGetManyUseCase,
      { execute: rename } as unknown as TagRenameUseCase,
      { execute: remove } as unknown as TagDeleteUseCase,
    );
  });

  describe('handleCreate', () => {
    it('creates the tag of the body', async () => {
      create.mockResolvedValue({ id: '303', name: 'heavy' });

      const response = await controller.handleCreate({ name: 'heavy' });

      expect(response).toEqual({ id: '303', name: 'heavy' });
      expect(create).toHaveBeenCalledWith({ name: 'heavy' });
    });
  });

  describe('handleGetMany', () => {
    it('lists the tags of the page window', async () => {
      getMany.mockResolvedValue({ page: 2, count: 0, pageCount: 0, total: 0, data: [] });

      const response = await controller.handleGetMany({ page: 2, limit: 5 });

      expect(response).toEqual({ page: 2, count: 0, pageCount: 0, total: 0, data: [] });
      expect(getMany).toHaveBeenCalledWith({ page: 2, limit: 5 });
    });
  });

  describe('handleRename', () => {
    it('renames the tag of the path to the name of the body', async () => {
      rename.mockResolvedValue({ id: '300', name: 'handle-with-care' });

      const response = await controller.handleRename(
        { tagId: '300' },
        { name: 'handle-with-care' },
      );

      expect(response).toEqual({ id: '300', name: 'handle-with-care' });
      expect(rename).toHaveBeenCalledWith({ tagId: '300', name: 'handle-with-care' });
    });
  });

  describe('handleDelete', () => {
    it('deletes the tag of the path', async () => {
      remove.mockResolvedValue(undefined);

      await expect(controller.handleDelete({ tagId: '300' })).resolves.toBeUndefined();

      expect(remove).toHaveBeenCalledWith({ tagId: '300' });
    });
  });
});
