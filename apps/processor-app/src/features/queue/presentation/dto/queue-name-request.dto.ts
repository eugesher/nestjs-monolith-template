import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

export class QueueNameRequestDto {
  @ApiProperty({ example: 'ledger-record' })
  @IsString()
  @MaxLength(64)
  public queueName: string;
}
