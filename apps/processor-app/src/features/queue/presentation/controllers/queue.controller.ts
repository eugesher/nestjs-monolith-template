import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  Query,
  UseFilters,
} from '@nestjs/common';
import { ApiNoContentResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { RequiresPermission } from '@acme-libs/auth';
import { PermissionCodeEnum } from '@acme-libs/kernel';

import {
  QueueDeleteFailedJobUseCase,
  QueueListFailedJobsUseCase,
  QueueListUseCase,
  QueueRetryFailedJobUseCase,
} from '../../application';
import { QueueFailedJobPageResponseDto } from '../dto/queue-failed-job-page-response.dto';
import { QueueJobRequestDto } from '../dto/queue-job-request.dto';
import { QueueListFailedJobsRequestDto } from '../dto/queue-list-failed-jobs-request.dto';
import { QueueNameRequestDto } from '../dto/queue-name-request.dto';
import { QueueResponseDto } from '../dto/queue-response.dto';
import { QueueHttpExceptionFilter } from '../filters/queue-http-exception.filter';

@ApiTags('Queues')
@UseFilters(QueueHttpExceptionFilter)
@Controller('queues')
export class QueueController {
  constructor(
    private readonly list: QueueListUseCase,
    private readonly listFailedJobs: QueueListFailedJobsUseCase,
    private readonly retryFailedJob: QueueRetryFailedJobUseCase,
    private readonly deleteFailedJob: QueueDeleteFailedJobUseCase,
  ) {}

  @Get()
  @RequiresPermission(PermissionCodeEnum.QUEUE_READ)
  @ApiOperation({ summary: 'List the queues with the counts of their jobs' })
  @ApiOkResponse({ type: [QueueResponseDto] })
  public async handleList(): Promise<QueueResponseDto[]> {
    return await this.list.execute();
  }

  @Get(':queueName/jobs/failed')
  @RequiresPermission(PermissionCodeEnum.QUEUE_READ)
  @ApiOperation({ summary: 'Browse the failed jobs of a queue, newest first' })
  @ApiOkResponse({ type: QueueFailedJobPageResponseDto })
  public async handleListFailedJobs(
    @Param() params: QueueNameRequestDto,
    @Query() query: QueueListFailedJobsRequestDto,
  ): Promise<QueueFailedJobPageResponseDto> {
    const { queueName } = params;
    const { page, limit } = query;

    return await this.listFailedJobs.execute({ queueName, page, limit });
  }

  @Put(':queueName/jobs/failed/:jobId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequiresPermission(PermissionCodeEnum.QUEUE_RETRY)
  @ApiOperation({ summary: 'Return a failed job to the queue' })
  @ApiNoContentResponse()
  public async handleRetryFailedJob(@Param() params: QueueJobRequestDto): Promise<void> {
    await this.retryFailedJob.execute(params);
  }

  @Delete(':queueName/jobs/failed/:jobId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequiresPermission(PermissionCodeEnum.QUEUE_DELETE)
  @ApiOperation({ summary: 'Delete a failed job' })
  @ApiNoContentResponse()
  public async handleDeleteFailedJob(@Param() params: QueueJobRequestDto): Promise<void> {
    await this.deleteFailedJob.execute(params);
  }
}
