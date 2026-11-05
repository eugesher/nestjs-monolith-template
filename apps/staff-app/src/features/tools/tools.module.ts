import { Module } from '@nestjs/common';

import { NoteModule, ReminderModule, TagModule } from './modules';

@Module({
  imports: [NoteModule, ReminderModule, TagModule],
})
export class ToolsModule {}
