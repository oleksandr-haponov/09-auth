import api from "./axios";
import type { Note } from "@/types/note";

export interface NotesQuery {
  search?: string;
  page?: number;
  tag?: string;
  perPage?: number;
}

export async function fetchNotes(q: NotesQuery = {}): Promise<Note[]> {
  const { perPage = 12, ...rest } = q;
  const { data } = await api.get<Note[]>("/notes", { params: { perPage, ...rest } });
  return data;
}

export async function fetchNoteById(id: string): Promise<Note> {
  const { data } = await api.get<Note>(`/notes/${id}`);
  return data;
}
