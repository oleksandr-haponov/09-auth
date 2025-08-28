import api from "./axios";
import type { Note } from "@/types/note";
export interface NotesQuery { search?: string; page?: number; tag?: string; perPage?: number; }
export async function fetchNotes(q: NotesQuery = {}): Promise<Note[]> {
  const { search, page, tag, perPage = 12 } = q;
  const { data } = await api.get<Note[]>("/notes", { params: { search, page, tag, perPage } });
  return data;
}
export async function fetchNoteById(id: string): Promise<Note> {
  const { data } = await api.get<Note>(`/notes/${id}`); return data;
}
export interface CreateNotePayload { title: string; content: string; tag: string; }
export async function createNote(payload: CreateNotePayload): Promise<Note> {
  const { data } = await api.post<Note>("/notes", payload); return data;
}
export async function deleteNote(id: string): Promise<Note> {
  const { data } = await api.delete<Note>(`/notes/${id}`); return data;
}
