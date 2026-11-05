export interface ITagDeleteRepositoryPort {
  delete(tagId: string): Promise<void>;
}

export const TAG_DELETE_REPOSITORY_PORT = Symbol('TAG_DELETE_REPOSITORY_PORT');
