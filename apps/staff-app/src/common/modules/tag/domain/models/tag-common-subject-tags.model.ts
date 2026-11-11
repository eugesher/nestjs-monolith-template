import type {
  ITagCommonSubjectTagsChangesOutput,
  ITagCommonSubjectTagsRecordInput,
} from '../interfaces';

export class TagCommonSubjectTagsModel {
  private constructor(private readonly tagIds: ReadonlySet<string>) {}

  public static reconstitute(record: ITagCommonSubjectTagsRecordInput): TagCommonSubjectTagsModel {
    const { tagIds } = record;

    return new TagCommonSubjectTagsModel(new Set(tagIds));
  }

  public static missingTagIds(requested: readonly string[], found: readonly string[]): string[] {
    const known = new Set(found);
    const distinct = new Set(requested);

    return [...distinct].filter((tagId) => !known.has(tagId));
  }

  public replace(tagIds: readonly string[]): ITagCommonSubjectTagsChangesOutput {
    const next = new Set(tagIds);
    const linkTagIds = [...next].filter((tagId) => !this.tagIds.has(tagId));
    const unlinkTagIds = [...this.tagIds].filter((tagId) => !next.has(tagId));

    return { linkTagIds, unlinkTagIds };
  }
}
