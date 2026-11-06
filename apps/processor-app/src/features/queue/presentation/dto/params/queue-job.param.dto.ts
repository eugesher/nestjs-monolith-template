import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

export class QueueJobParamDto {
  @ApiProperty({ example: 'ledger-record' })
  @IsString()
  @MaxLength(64)
  public queueName: string;

  @ApiProperty({ example: '42' })
  @IsString()
  @MaxLength(128)
  public jobId: string;
}
