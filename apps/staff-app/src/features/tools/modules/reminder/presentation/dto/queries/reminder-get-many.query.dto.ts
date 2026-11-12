import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

import { PageQueryDto } from '@acme-libs/http';
import { ReminderStatusEnum } from '@acme-libs/kernel';

export class ReminderGetManyQueryDto extends PageQueryDto {
  @ApiPropertyOptional({ enum: ReminderStatusEnum })
  @IsOptional()
  @IsEnum(ReminderStatusEnum)
  public status?: ReminderStatusEnum;
}
