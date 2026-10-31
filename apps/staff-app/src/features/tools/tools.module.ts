import { Module } from '@nestjs/common';

import { NoteModule, ReminderModule } from './modules';

@Module({
  imports: [NoteModule, ReminderModule],
})
export class ToolsModule {}
