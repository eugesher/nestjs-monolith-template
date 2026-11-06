import { IHostedRepository, IRepositoryHostPort } from '@acme-libs/contracts/database';
import { SubjectTag, Tag } from '@acme-staff/common/entities';
import { TagCommonPersistenceBuilder } from '../builders/tag-common-persistence.builder';
import { TagCommonPersistenceSubjectTagBuilder } from '../builders/tag-common-persistence-subject-tag.builder';

export abstract class TagCommonPersistenceHost {
  protected abstract readonly repositoryHost: IRepositoryHostPort;

  protected get subjectTagRepository(): IHostedRepository<SubjectTag> {
    return this.repositoryHost.getRepository(SubjectTag);
  }

  protected get tagRepository(): IHostedRepository<Tag> {
    return this.repositoryHost.getRepository(Tag);
  }

  protected createTagBuilder(): TagCommonPersistenceBuilder {
    return new TagCommonPersistenceBuilder(this.tagRepository.createQueryBuilder(Tag.name));
  }

  protected createSubjectTagBuilder(): TagCommonPersistenceSubjectTagBuilder {
    return new TagCommonPersistenceSubjectTagBuilder(
      this.subjectTagRepository.createQueryBuilder(SubjectTag.name),
    );
  }
}
