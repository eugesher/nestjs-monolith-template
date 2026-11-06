export interface INoteWriteCommand {
  noteId: string;
}

export interface INoteWriteReloadCommand {
  noteId: string;
  authorId: string;
  saved: boolean;
}
