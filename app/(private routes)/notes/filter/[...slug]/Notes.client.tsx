"use client";

import { useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { fetchNotes } from "@/lib/api";

type Note = {
  id: string;
  title: string;
  content: string;
  tag: string;
  createdAt?: string;
  updatedAt?: string;
};

type NotesResponse = {
  notes: Note[];
  totalPages?: number;
};

export type NotesClientProps = {
  /** Тег из сегмента маршрута; null если “все” */
  tag: string | null;
};

export default function NotesClient({ tag }: NotesClientProps) {
  const router = useRouter();
  const sp = useSearchParams();

  const q = sp.get("q") ?? "";
  const page = Number(sp.get("page") ?? "1");
  const normalizedTag = tag ?? ""; // важливо: як і на сервері для ключа

  const { data, isLoading, isError, error } = useQuery<NotesResponse>({
    queryKey: ["notes", { q, page, tag: normalizedTag }],
    queryFn: async () => {
      // fetchNotes ожидает { search, page, tag }
      const raw: any = await fetchNotes({ search: q, page, tag: tag ?? undefined });
      if (Array.isArray(raw)) return { notes: raw };
      return {
        notes: Array.isArray(raw?.notes) ? raw.notes : [],
        totalPages: raw?.totalPages,
      };
    },
    // v5: вместо keepPreviousData
    placeholderData: (prev) => prev,
  });

  const totalPages = data?.totalPages ?? 1;
  const notes = useMemo(() => data?.notes ?? [], [data]);

  const goToPage = (nextPage: number) => {
    const params = new URLSearchParams(sp);
    if (nextPage <= 1) params.delete("page");
    else params.set("page", String(nextPage));
    router.push(`?${params.toString()}`);
  };

  if (isLoading) return <p style={{ padding: 16 }}>Loading...</p>;
  if (isError) {
    const msg =
      (error as any)?.response?.data?.message ||
      (error as Error)?.message ||
      "Failed to load notes";
    return <p style={{ padding: 16, color: "#c00" }}>{msg}</p>;
  }

  if (!notes.length) {
    return <p style={{ padding: 16 }}>No notes found.</p>;
  }

  return (
    <section style={{ width: "100%", maxWidth: 960, margin: "0 auto", padding: 16 }}>
      <header style={{ marginBottom: 12 }}>
        <h2 style={{ margin: 0 }}>Notes{tag ? ` — ${tag}` : ""}</h2>
        {q && <p style={{ margin: "4px 0 0", color: "#666" }}>Search: “{q}”</p>}
      </header>

      <ul style={{ display: "grid", gap: 12, padding: 0, listStyle: "none" }}>
        {notes.map((n) => (
          <li
            key={n.id}
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 8,
              padding: 12,
              background: "#fff",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <h3 style={{ margin: 0 }}>{n.title}</h3>
              <span
                style={{
                  fontSize: 12,
                  padding: "2px 8px",
                  borderRadius: 999,
                  background: "#f3f4f6",
                  color: "#374151",
                  whiteSpace: "nowrap",
                  alignSelf: "flex-start",
                }}
              >
                {n.tag}
              </span>
            </div>
            <p style={{ marginTop: 8, color: "#4b5563" }}>
              {n.content?.slice(0, 160) ?? ""}
              {n.content && n.content.length > 160 ? "…" : ""}
            </p>
          </li>
        ))}
      </ul>

      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
          <button
            type="button"
            onClick={() => goToPage(Math.max(1, page - 1))}
            disabled={page <= 1}
          >
            ← Prev
          </button>
          <span style={{ color: "#555" }}>
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => goToPage(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
          >
            Next →
          </button>
        </div>
      )}
    </section>
  );
}
