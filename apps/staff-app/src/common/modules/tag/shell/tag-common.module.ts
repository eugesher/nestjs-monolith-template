import { Module } from '@nestjs/common';

import { TAG_COMMON_PORT } from '@acme-staff/contracts/tag';

import {
  TagCommonFindSubjectIdsUseCase,
  TagCommonFindUseCase,
  TagCommonReplaceUseCase,
} from '../application';
import {
  TagCommonFindRepository,
  TagCommonFindSubjectIdsRepository,
  TagCommonReplaceRepository,
} from '../infrastructure';
import {
  TAG_COMMON_FIND_REPOSITORY_PORT,
  TAG_COMMON_FIND_SUBJECT_IDS_REPOSITORY_PORT,
  TAG_COMMON_REPLACE_REPOSITORY_PORT,
} from '../outbound';
import { TagCommonFacade } from './tag-common.facade';

@Module({
  exports: [TAG_COMMON_PORT],
  providers: [
    { provide: TAG_COMMON_PORT, useClass: TagCommonFacade },
    TagCommonFindSubjectIdsUseCase,
    TagCommonFindUseCase,
    TagCommonReplaceUseCase,
    { provide: TAG_COMMON_FIND_REPOSITORY_PORT, useClass: TagCommonFindRepository },
    {
      provide: TAG_COMMON_FIND_SUBJECT_IDS_REPOSITORY_PORT,
      useClass: TagCommonFindSubjectIdsRepository,
    },
    { provide: TAG_COMMON_REPLACE_REPOSITORY_PORT, useClass: TagCommonReplaceRepository },
  ],
})
export class TagCommonModule {}
