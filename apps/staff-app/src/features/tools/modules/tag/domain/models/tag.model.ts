import { AggregateRoot } from '@acme-libs/toolkit';

import { TagNameInvalidException } from '../exceptions/tag-name-invalid.exception';
import { ITagCandidate } from '../interfaces/tag-candidate.interface';
import { ITagDraft } from '../interfaces/tag-draft.interface';
import { ITagRecord } from '../interfaces/tag-record.interface';
import { ITagSnapshot } from '../interfaces/tag-snapshot.interface';

export class TagModel extends AggregateRoot<string> {
  private static readonly NAME_MAX_LENGTH = 64;

  private constructor(
    id: string,
    private currentName: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {
    super(id);
  }

  public static reconstitute(record: ITagRecord): TagModel {
    const { id, name, createdAt, updatedAt } = record;
    const validName = TagModel.validName(name);

    return new TagModel(id, validName, createdAt, updatedAt);
  }

  public static createDraft(candidate: ITagCandidate): ITagDraft {
    const { name } = candidate;
    const validName = TagModel.validName(name);

    return { name: validName };
  }

  private static validName(name: string): string {
    const trimmed = name.trim();

    if (trimmed.length === 0 || trimmed.length > TagModel.NAME_MAX_LENGTH) {
      throw new TagNameInvalidException(TagModel.NAME_MAX_LENGTH);
    }

    return trimmed;
  }

  public get name(): string {
    return this.currentName;
  }

  public rename(name: string): void {
    this.currentName = TagModel.validName(name);
  }

  public toView(): ITagSnapshot {
    return {
      id: this.id,
      name: this.name,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
