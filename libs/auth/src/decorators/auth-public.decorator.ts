import { CustomDecorator, SetMetadata } from '@nestjs/common';

import { AuthMetadataKeyEnum } from '../enums/auth-metadata-key.enum';

export const Public = (): CustomDecorator => SetMetadata(AuthMetadataKeyEnum.PUBLIC, true);
