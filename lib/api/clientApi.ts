
import { nextServer } from "./api";
import type { Note, NewNoteData, LoginRequestData, RegisterRequestData, CheckSessionRequest } from "@/types/note";
import type { User} from "@/types/user";
import { NotesHttpResponse } from "../../types/note";

export interface FetchNotesParams {
  page?: number;
  perPage?: number;
  search?: string;
  tag?: string | undefined;
}

// получаем список всех ноутсов
export async function fetchNotes({
  page = 1,
  perPage = 12,
  search = "",
  tag = undefined,
}: FetchNotesParams): Promise<NotesHttpResponse> {

   const params = {
      // генеруємо параметры
      page, //  с документации
      perPage, //  с документации
      ...(search?.trim() ? { search } : {}),
      tag,
    }

    const response = await nextServer.get("/notes", { params });
  return response.data;
}

export async function fetchNoteById(id: string): Promise<Note> {
  const response = await nextServer.get<Note>(`/notes/${id}`, {});

  return response.data;
}

export async function createNote(noteData: NewNoteData): Promise<Note> {
  const response = await nextServer.post<Note>("/notes", noteData, {});
  return response.data;
}

export async function deleteNote(noteId: string): Promise<Note> {
  const response = await nextServer.delete<Note>(`/notes/${noteId}`, {});

  return response.data;
}

// login
export async function signIn (noteData: LoginRequestData): Promise<User> {
const  response  = await nextServer.post<User>(`/auth/login`, noteData)
return response.data;
}

//sign up
export async function signUp (payload: RegisterRequestData): Promise<User> {
const  response  = await nextServer.post<User>(`/auth/register`, payload)
return response.data;
}

//checkSession
export async function checkSession(): Promise<CheckSessionRequest> {
  const response = await nextServer.get<CheckSessionRequest>('/auth/session');
  return response.data;
};

// users/me
export async function usersMe(): Promise<User> {
  const { data } = await nextServer.get<User>('/users/me');
  return data;
};

// logout
export async function logout (): Promise<void> {
  await nextServer.post('/auth/logout')
};

// edit user
export async function editUser(payload: { username: string }): Promise<User> {
  const { data } = await nextServer.patch<User>('/users/me', payload);
  return data;
};




