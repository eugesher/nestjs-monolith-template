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
import { ReminderCreateRequestDto } from '../dto/reminder-create-request.dto';
import { ReminderGetManyRequestDto } from '../dto/reminder-get-many-request.dto';
import { ReminderIdRequestDto } from '../dto/reminder-id-request.dto';
import { ReminderPageResponseDto } from '../dto/reminder-page-response.dto';
import { ReminderRescheduleRequestDto } from '../dto/reminder-reschedule-request.dto';
import { ReminderResponseDto } from '../dto/reminder-response.dto';
import { ReminderSummaryResponseDto } from '../dto/reminder-summary-response.dto';
import { ReminderHttpExceptionFilter } from '../filters/reminder-http-exception.filter';

@ApiTags('Reminder')
@UseFilters(ReminderHttpExceptionFilter)
@Controller('reminders')
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
  public handleCreate(
    @Body() request: ReminderCreateRequestDto,
    @CurrentUser() user: IAuthCurrentUserView,
  ): Promise<ReminderResponseDto> {
    const { title, body, dueOn } = request;

    return this.create.execute({ ownerId: user.id, title, body, dueOn });
  }

  @Get()
  @ApiOperation({ summary: 'List your reminders, soonest first' })
  @ApiOkResponse({ type: ReminderPageResponseDto })
  public handleGetMany(
    @Query() query: ReminderGetManyRequestDto,
    @CurrentUser() user: IAuthCurrentUserView,
  ): Promise<ReminderPageResponseDto> {
    const { page, size, status } = query;

    return this.getMany.execute({ page, size, ownerId: user.id, status });
  }

  @Get('summary')
  @ApiOperation({ summary: 'How many of your reminders are pending, and when the next is due' })
  @ApiOkResponse({ type: ReminderSummaryResponseDto })
  public handleGetSummary(
    @CurrentUser() user: IAuthCurrentUserView,
  ): Promise<ReminderSummaryResponseDto> {
    return this.getSummary.execute({ ownerId: user.id });
  }

  @Patch(':reminderId/done')
  @ApiOperation({ summary: 'Mark one of your reminders as done' })
  @ApiOkResponse({ type: ReminderResponseDto })
  public handleComplete(
    @Param() params: ReminderIdRequestDto,
    @CurrentUser() user: IAuthCurrentUserView,
  ): Promise<ReminderResponseDto> {
    const { reminderId } = params;

    return this.complete.execute({ reminderId, ownerId: user.id });
  }

  @Patch(':reminderId/due-on')
  @ApiOperation({ summary: 'Move one of your reminders to another day' })
  @ApiOkResponse({ type: ReminderResponseDto })
  public handleReschedule(
    @Param() params: ReminderIdRequestDto,
    @Body() body: ReminderRescheduleRequestDto,
    @CurrentUser() user: IAuthCurrentUserView,
  ): Promise<ReminderResponseDto> {
    const { reminderId } = params;
    const { dueOn } = body;

    return this.reschedule.execute({ reminderId, ownerId: user.id, dueOn });
  }

  @Delete(':reminderId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete one of your reminders' })
  @ApiNoContentResponse()
  public handleDelete(
    @Param() params: ReminderIdRequestDto,
    @CurrentUser() user: IAuthCurrentUserView,
  ): Promise<void> {
    const { reminderId } = params;

    return this.remove.execute({ reminderId, ownerId: user.id });
  }
}
