export interface INoteWriteRunCommand {
  noteId: string;
}

export interface INoteWriteReloadCommand {
  noteId: string;
  authorId: string;
  isSaved: boolean;
}
