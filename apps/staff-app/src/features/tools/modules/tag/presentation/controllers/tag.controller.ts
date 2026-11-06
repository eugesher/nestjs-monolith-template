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

import { RequiresPermission } from '@acme-libs/auth';
import { PermissionCodeEnum } from '@acme-libs/kernel';

import {
  TagCreateUseCase,
  TagDeleteUseCase,
  TagGetManyUseCase,
  TagRenameUseCase,
} from '../../application';
import {
  TagCreateRequestDto,
  TagGetManyQueryDto,
  TagIdParamDto,
  TagPageResponseDto,
  TagRenameRequestDto,
  TagResponseDto,
} from '../dto';
import { TagHttpExceptionFilter } from '../filters/tag-http-exception.filter';

@ApiTags('Tools/Tag')
@UseFilters(TagHttpExceptionFilter)
@Controller('tools/tags')
export class TagController {
  constructor(
    private readonly create: TagCreateUseCase,
    private readonly getMany: TagGetManyUseCase,
    private readonly rename: TagRenameUseCase,
    private readonly remove: TagDeleteUseCase,
  ) {}

  @Post()
  @RequiresPermission(PermissionCodeEnum.TAG_WRITE)
  @ApiOperation({ summary: 'Create a tag' })
  @ApiCreatedResponse({ type: TagResponseDto })
  public async handleCreate(@Body() body: TagCreateRequestDto): Promise<TagResponseDto> {
    const { name } = body;

    return await this.create.execute({ name });
  }

  @Get()
  @RequiresPermission(PermissionCodeEnum.TAG_READ)
  @ApiOperation({ summary: 'List the tags by name' })
  @ApiOkResponse({ type: TagPageResponseDto })
  public async handleGetMany(@Query() query: TagGetManyQueryDto): Promise<TagPageResponseDto> {
    const { page, limit } = query;

    return await this.getMany.execute({ page, limit });
  }

  @Patch(':tagId')
  @RequiresPermission(PermissionCodeEnum.TAG_WRITE)
  @ApiOperation({ summary: 'Rename a tag' })
  @ApiOkResponse({ type: TagResponseDto })
  public async handleRename(
    @Param() params: TagIdParamDto,
    @Body() body: TagRenameRequestDto,
  ): Promise<TagResponseDto> {
    const { tagId } = params;
    const { name } = body;

    return await this.rename.execute({ tagId, name });
  }

  @Delete(':tagId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequiresPermission(PermissionCodeEnum.TAG_WRITE)
  @ApiOperation({ summary: 'Delete a tag and unlink it from every subject' })
  @ApiNoContentResponse()
  public async handleDelete(@Param() params: TagIdParamDto): Promise<void> {
    const { tagId } = params;

    await this.remove.execute({ tagId });
  }
}
