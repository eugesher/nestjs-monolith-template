import { AggregateRoot } from '@acme-libs/toolkit';

import { TagNameInvalidException } from '../exceptions/tag-name-invalid.exception';
import type {
  ITagCandidateInput,
  ITagDraftOutput,
  ITagRecordInput,
  ITagSnapshotOutput,
} from '../interfaces';

export class TagModel extends AggregateRoot<string> {
  public get name(): string {
    return this.currentName;
  }

  private static readonly NAME_MAX_LENGTH = 64;

  private constructor(
    id: string,
    private currentName: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {
    super(id);
  }

  public static reconstitute(record: ITagRecordInput): TagModel {
    const { id, name, createdAt, updatedAt } = record;
    const validName = TagModel.validName(name);

    return new TagModel(id, validName, createdAt, updatedAt);
  }

  public static createDraft(candidate: ITagCandidateInput): ITagDraftOutput {
    const { name } = candidate;
    const validName = TagModel.validName(name);

    return { name: validName };
  }

  public rename(name: string): void {
    this.currentName = TagModel.validName(name);
  }

  public toSnapshot(): ITagSnapshotOutput {
    return {
      id: this.id,
      name: this.name,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }

  private static validName(name: string): string {
    const trimmed = name.trim();

    if (trimmed.length === 0 || trimmed.length > TagModel.NAME_MAX_LENGTH) {
      throw new TagNameInvalidException(TagModel.NAME_MAX_LENGTH);
    }

    return trimmed;
  }
}
