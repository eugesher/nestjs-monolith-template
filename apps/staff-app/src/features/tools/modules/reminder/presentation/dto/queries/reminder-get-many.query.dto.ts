import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsPositive } from 'class-validator';

import { ReminderStatusEnum } from '@acme-libs/kernel';

export class ReminderGetManyQueryDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  public page?: number;

  @ApiPropertyOptional({ example: 20, description: 'Capped at 100' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  public limit?: number;

  @ApiPropertyOptional({ enum: ReminderStatusEnum })
  @IsOptional()
  @IsEnum(ReminderStatusEnum)
  public status?: ReminderStatusEnum;
}
