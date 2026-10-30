import { Body, Controller, Get, Param, Patch, Post, Query, UseFilters } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '@acme-libs/auth';
import type { IAuthCurrentUserView } from '@acme-libs/contracts/auth';
import {
  NoteCreateUseCase,
  NoteEditUseCase,
  NoteGetManyUseCase,
  NoteGetOneUseCase,
  NoteGetRevisionsUseCase,
  NoteResolveUseCase,
} from '../../application';
import { NoteCreateRequestDto } from '../dto/note-create-request.dto';
import { NoteEditRequestDto } from '../dto/note-edit-request.dto';
import { NoteGetManyRequestDto } from '../dto/note-get-many-request.dto';
import { NoteGetRevisionsRequestDto } from '../dto/note-get-revisions-request.dto';
import { NoteIdRequestDto } from '../dto/note-id-request.dto';
import { NotePageResponseDto } from '../dto/note-page-response.dto';
import { NoteResponseDto } from '../dto/note-response.dto';
import { NoteRevisionPageResponseDto } from '../dto/note-revision-page-response.dto';
import { NoteHttpExceptionFilter } from '../filters/note-http-exception.filter';

@ApiTags('Note')
@UseFilters(NoteHttpExceptionFilter)
@Controller('notes')
export class NoteController {
  constructor(
    private readonly create: NoteCreateUseCase,
    private readonly getMany: NoteGetManyUseCase,
    private readonly getOne: NoteGetOneUseCase,
    private readonly edit: NoteEditUseCase,
    private readonly resolve: NoteResolveUseCase,
    private readonly getRevisions: NoteGetRevisionsUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Attach a back-office note to any subject' })
  @ApiCreatedResponse({ type: NoteResponseDto })
  public handleCreate(
    @Body() request: NoteCreateRequestDto,
    @CurrentUser() user: IAuthCurrentUserView,
  ): Promise<NoteResponseDto> {
    const { subjectType, subjectId, body } = request;

    return this.create.execute({ subjectType, subjectId, body, authorId: user.id });
  }

  @Get()
  @ApiOperation({ summary: 'Browse your notes, newest first, optionally of one subject' })
  @ApiOkResponse({ type: NotePageResponseDto })
  public handleGetMany(
    @Query() query: NoteGetManyRequestDto,
    @CurrentUser() user: IAuthCurrentUserView,
  ): Promise<NotePageResponseDto> {
    const { page, size, subjectType, subjectId, resolved } = query;

    return this.getMany.execute({
      page,
      size,
      subjectType,
      subjectId,
      resolved,
      authorId: user.id,
    });
  }

  @Get(':noteId')
  @ApiOperation({ summary: 'Read one of your notes' })
  @ApiOkResponse({ type: NoteResponseDto })
  public handleGetOne(
    @Param() params: NoteIdRequestDto,
    @CurrentUser() user: IAuthCurrentUserView,
  ): Promise<NoteResponseDto> {
    const { noteId } = params;

    return this.getOne.execute({ noteId, authorId: user.id });
  }

  @Patch(':noteId')
  @ApiOperation({
    summary: 'Rewrite the body of one of your notes and record the revision with it',
  })
  @ApiOkResponse({ type: NoteResponseDto })
  public handleEdit(
    @Param() params: NoteIdRequestDto,
    @Body() request: NoteEditRequestDto,
    @CurrentUser() user: IAuthCurrentUserView,
  ): Promise<NoteResponseDto> {
    const { noteId } = params;
    const { body } = request;

    return this.edit.execute({ noteId, body, editorId: user.id });
  }

  @Patch(':noteId/resolve')
  @ApiOperation({ summary: 'Resolve one of your notes for good; it can no longer be edited' })
  @ApiOkResponse({ type: NoteResponseDto })
  public handleResolve(
    @Param() params: NoteIdRequestDto,
    @CurrentUser() user: IAuthCurrentUserView,
  ): Promise<NoteResponseDto> {
    const { noteId } = params;

    return this.resolve.execute({ noteId, authorId: user.id });
  }

  @Get(':noteId/revisions')
  @ApiOperation({ summary: 'Read the edit history of one of your notes, newest first' })
  @ApiOkResponse({ type: NoteRevisionPageResponseDto })
  public handleGetRevisions(
    @Param() params: NoteIdRequestDto,
    @Query() query: NoteGetRevisionsRequestDto,
    @CurrentUser() user: IAuthCurrentUserView,
  ): Promise<NoteRevisionPageResponseDto> {
    const { noteId } = params;
    const { page, size } = query;

    return this.getRevisions.execute({ noteId, authorId: user.id, page, size });
  }
}
