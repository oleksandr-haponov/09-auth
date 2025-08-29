"use client";

import { useEffect, useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { fetchNotes } from "@/lib/api/notes";
import type { Note } from "@/types/note";
import Link from "next/link";

export default function NotesPage() {
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebounced(search.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading, isError, error, isFetching } = useQuery<Note[]>({
    queryKey: ["notes", { search: debounced, page }],
    queryFn: () => fetchNotes({ search: debounced, page, perPage: 12 }),
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });

  if (isLoading) return <main style={{ padding: 24 }}>Loading...</main>;
  if (isError)
    return <main style={{ padding: 24, color: "#b91c1c" }}>{(error as Error).message}</main>;

  const notes = data ?? [];

  return (
    <main style={{ padding: 24 }}>
      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search notes..."
          style={{ padding: "8px 12px", flex: "1 1 320px" }}
        />
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1 || isFetching}
        >
          Prev
        </button>
        <button onClick={() => setPage((p) => p + 1)} disabled={isFetching}>
          Next
        </button>
      </div>

      {notes.length === 0 ? (
        <p>No notes found.</p>
      ) : (
        <ul
          style={{
            display: "grid",
            gap: 16,
            gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))",
          }}
        >
          {notes.map((n) => (
            <li
              key={n.id}
              style={{
                border: "1px solid #dee2e6",
                borderRadius: 8,
                padding: 16,
                background: "#fff",
              }}
            >
              <h3 style={{ marginTop: 0 }}>{n.title}</h3>
              <p>{n.content}</p>
              <div
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
              >
                <span
                  title={n.tag}
                  style={{
                    padding: "2px 8px",
                    border: "1px solid #b6d4fe",
                    borderRadius: 12,
                    color: "#0d6efd",
                    background: "#e7f1ff",
                  }}
                >
                  {n.tag}
                </span>
                {/* ВАЖНО: ссылка внутри того же layout-scope для перехвата модалкой */}
                <Link href={`/notes/${n.id}`} style={{ textDecoration: "none", color: "#0d6efd" }}>
                  View details
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
