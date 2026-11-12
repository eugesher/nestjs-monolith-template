import { SetMetadata, type CustomDecorator } from '@nestjs/common';

import { ThrottleMetadataKeyEnum } from '../enums/throttle-metadata-key.enum';

export const AuthThrottle = (): CustomDecorator => SetMetadata(ThrottleMetadataKeyEnum.AUTH, true);
