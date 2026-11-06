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
import { TagCommonFacade } from './tag-common.facade';

@Module({
  exports: [TAG_COMMON_PORT],
  providers: [
    { provide: TAG_COMMON_PORT, useClass: TagCommonFacade },
    TagCommonFindSubjectIdsUseCase,
    TagCommonFindUseCase,
    TagCommonReplaceUseCase,
    TagCommonFindRepository.provider,
    TagCommonFindSubjectIdsRepository.provider,
    TagCommonReplaceRepository.provider,
  ],
})
export class TagCommonModule {}
