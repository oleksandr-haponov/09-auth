import { NotesHttpResponse, Note } from "@/types/note";
import { User } from "@/types/user";
import { cookies } from "next/headers";
import { nextServer } from "./api";

// checkServerSession
export async function checkServerSession () {
 // Достаем текущие cookie 
 const cookieStore = await cookies ();
 const response = await nextServer.get('/auth/session', {
  headers : {
   // передаем cookie далее 
   Cookie: cookieStore.toString(), 
  }
 })
 return response;
}

//usersServerMe
export async function usersServerMe ():Promise <User> {
   const cookieStore = await  cookies ();
   const {data} = await nextServer.get ( '/users/me' , {
     headers : {
       Cookie : cookieStore. toString (),
    },
  });
  return data;
};


export const fetchNotes = async (
  search: string,
  page: number, 
  tag: string | undefined
): Promise<NotesHttpResponse> => {
  const cookieStore = await cookies();
  const params = {
    ...(search && { search }),
    tag,
    page,
    perPage: 12,
  };
  const headers = {
    Cookie: cookieStore.toString(),
  };
  const response = await nextServer.get<NotesHttpResponse>('/notes', {
    params,
    headers,
  });
  return response.data;
};

// note ID
export async function fetchNoteById(id: string): Promise<Note> {
  const cookieStore = await cookies();
  const headers = {
    Cookie: cookieStore.toString(),
  };

  const response = await nextServer.get<Note>(`/notes/${id}`, {
    headers,
  });

  return response.data;
}