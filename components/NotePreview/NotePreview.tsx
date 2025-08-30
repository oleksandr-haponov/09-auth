"use client";

import type { Note } from "@/types/note";

type Props = {
  note: Note | null; // допускаем null
  onBack?: () => void; // поддерживаем проп onBack
};

export default function NotePreview({ note, onBack }: Props) {
  if (!note) {
    return (
      <article style={{ display: "grid", gap: 12 }}>
        <header>
          <h2 style={{ margin: 0, fontSize: 22 }}>Note not found</h2>
        </header>
        <div style={{ opacity: 0.8 }}>The note could not be loaded.</div>
        {onBack && (
          <div style={{ marginTop: 12 }}>
            <button onClick={onBack} style={{ padding: "6px 12px" }}>
              Back
            </button>
          </div>
        )}
      </article>
    );
  }

  return (
    <article style={{ display: "grid", gap: 12 }}>
      <header style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <h2 style={{ margin: 0, fontSize: 22 }}>{note.title}</h2>
        <small style={{ opacity: 0.8 }}>#{note.tag}</small>
      </header>
      <section>
        <p style={{ whiteSpace: "pre-wrap", margin: 0 }}>{note.content}</p>
      </section>
      {onBack && (
        <div>
          <button onClick={onBack} style={{ marginTop: 12, padding: "6px 12px" }}>
            Back
          </button>
        </div>
      )}
    </article>
  );
}
