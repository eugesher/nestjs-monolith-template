import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';

import { ReminderStatusEnum } from '@acme-libs/kernel';

export class ReminderGetManyRequestDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  public page?: number;

  @ApiPropertyOptional({ example: 20, description: 'Capped at 100' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  public size?: number;

  @ApiPropertyOptional({ enum: ReminderStatusEnum })
  @IsOptional()
  @IsEnum(ReminderStatusEnum)
  public status?: ReminderStatusEnum;
}
