import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseFilters,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from '@acme-libs/auth';
import type { IAuthCurrentUserView } from '@acme-libs/contracts/auth';

import {
  ReminderCompleteUseCase,
  ReminderCreateUseCase,
  ReminderDeleteUseCase,
  ReminderGetManyUseCase,
  ReminderGetSummaryUseCase,
  ReminderRescheduleUseCase,
} from '../../application';
import {
  ReminderCreateRequestDto,
  ReminderGetManyQueryDto,
  ReminderIdParamDto,
  ReminderPageResponseDto,
  ReminderRescheduleRequestDto,
  ReminderResponseDto,
  ReminderSummaryResponseDto,
} from '../dto';
import { ReminderHttpExceptionFilter } from '../filters/reminder-http-exception.filter';

@ApiTags('Tools/Reminder')
@UseFilters(ReminderHttpExceptionFilter)
@Controller('tools/reminders')
export class ReminderController {
  constructor(
    private readonly create: ReminderCreateUseCase,
    private readonly getMany: ReminderGetManyUseCase,
    private readonly getSummary: ReminderGetSummaryUseCase,
    private readonly complete: ReminderCompleteUseCase,
    private readonly reschedule: ReminderRescheduleUseCase,
    private readonly remove: ReminderDeleteUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a reminder for yourself' })
  @ApiCreatedResponse({ type: ReminderResponseDto })
  public async handleCreate(
    @Body() request: ReminderCreateRequestDto,
    @CurrentUser() user: IAuthCurrentUserView,
  ): Promise<ReminderResponseDto> {
    const { title, body, dueOn } = request;

    return await this.create.execute({ ownerId: user.id, title, body, dueOn });
  }

  @Get()
  @ApiOperation({ summary: 'List your reminders, soonest first' })
  @ApiOkResponse({ type: ReminderPageResponseDto })
  public async handleGetMany(
    @Query() query: ReminderGetManyQueryDto,
    @CurrentUser() user: IAuthCurrentUserView,
  ): Promise<ReminderPageResponseDto> {
    const { page, limit, status } = query;

    return await this.getMany.execute({ page, limit, ownerId: user.id, status });
  }

  @Get('summary')
  @ApiOperation({ summary: 'How many of your reminders are pending, and when the next is due' })
  @ApiOkResponse({ type: ReminderSummaryResponseDto })
  public async handleGetSummary(
    @CurrentUser() user: IAuthCurrentUserView,
  ): Promise<ReminderSummaryResponseDto> {
    return await this.getSummary.execute({ ownerId: user.id });
  }

  @Patch(':reminderId/done')
  @ApiOperation({ summary: 'Mark one of your reminders as done' })
  @ApiOkResponse({ type: ReminderResponseDto })
  public async handleComplete(
    @Param() params: ReminderIdParamDto,
    @CurrentUser() user: IAuthCurrentUserView,
  ): Promise<ReminderResponseDto> {
    const { reminderId } = params;

    return await this.complete.execute({ reminderId, ownerId: user.id });
  }

  @Patch(':reminderId/due-on')
  @ApiOperation({ summary: 'Move one of your reminders to another day' })
  @ApiOkResponse({ type: ReminderResponseDto })
  public async handleReschedule(
    @Param() params: ReminderIdParamDto,
    @Body() body: ReminderRescheduleRequestDto,
    @CurrentUser() user: IAuthCurrentUserView,
  ): Promise<ReminderResponseDto> {
    const { reminderId } = params;
    const { dueOn } = body;

    return await this.reschedule.execute({ reminderId, ownerId: user.id, dueOn });
  }

  @Delete(':reminderId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete one of your reminders' })
  @ApiNoContentResponse()
  public async handleDelete(
    @Param() params: ReminderIdParamDto,
    @CurrentUser() user: IAuthCurrentUserView,
  ): Promise<void> {
    const { reminderId } = params;

    await this.remove.execute({ reminderId, ownerId: user.id });
  }
}
