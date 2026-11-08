export interface INoteWriteRunCommand {
  noteId: string;
}

export interface INoteWriteReloadCommand {
  noteId: string;
  authorId: string;
  saved: boolean;
}
