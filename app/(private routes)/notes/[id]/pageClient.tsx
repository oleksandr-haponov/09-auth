"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { fetchNoteById } from "@/lib/api/notes";
import type { Note } from "@/types/note";

export default function NoteDetailsClient({ id }: { id: string }) {
  const router = useRouter();
  const { data, isLoading, isError, error } = useQuery<Note>({
    queryKey: ["note", id],
    queryFn: () => fetchNoteById(id),
    refetchOnMount: false,
    retry: false,
  });

  if (isLoading) return <main style={{ padding: 24 }}>Loading...</main>;
  if (isError)
    return <main style={{ padding: 24, color: "#b91c1c" }}>{(error as Error).message}</main>;
  if (!data) return <main style={{ padding: 24 }}>Note not found.</main>;

  return (
    <main style={{ padding: 24 }}>
      <button onClick={() => router.back()} style={{ marginBottom: 12 }}>
        ← Back
      </button>
      <h1>{data.title}</h1>
      <p>{data.content}</p>
      <p style={{ opacity: 0.6 }}>{new Date(data.createdAt).toLocaleDateString()}</p>
    </main>
  );
}
