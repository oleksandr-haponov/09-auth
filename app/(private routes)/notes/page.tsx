"use client";

import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { fetchNotes } from "@/lib/api/notes";

export default function NotesPage() {
  const sp = useSearchParams();
  const page = Number(sp.get("page") || "1");
  const search = sp.get("search") || undefined;
  const tag = sp.get("tag") || undefined;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["notes", { page, search, tag }],
    queryFn: () => fetchNotes({ page, search, tag, perPage: 12 }),
    staleTime: 0,
  });

  if (isLoading) {
    return <main style={{ padding: 24 }}>Loading notes...</main>;
  }
  if (isError) {
    return (
      <main style={{ padding: 24, color: "#dc3545" }}>
        {(error as Error)?.message || "Failed to load notes"}
      </main>
    );
  }

  const notes = data ?? [];
  return (
    <main style={{ padding: 24 }}>
      <h1>Notes</h1>
      {!notes.length ? (
        <p>No notes yet.</p>
      ) : (
        <ul
          style={{
            display: "grid",
            gap: 12,
            gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))",
            padding: 0,
          }}
        >
          {notes.map((n) => (
            <li
              key={n.id}
              style={{
                listStyle: "none",
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                padding: 12,
                background: "#fff",
              }}
            >
              <h3 style={{ margin: "0 0 6px" }}>{n.title}</h3>
              <small style={{ opacity: 0.7 }}>#{n.tag}</small>
              <p style={{ margin: "8px 0 0", whiteSpace: "pre-wrap", color: "#334155" }}>
                {n.content.slice(0, 160)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
