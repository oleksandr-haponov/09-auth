"use client";

import type { Note } from "@/types/note";

type Props = {
  note: Note;
};

export default function NotePreview({ note }: Props) {
  return (
    <article style={{ display: "grid", gap: 12 }}>
      <header>
        <h2 style={{ margin: 0, fontSize: 22 }}>{note.title}</h2>
        <small style={{ opacity: 0.8 }}>#{note.tag}</small>
      </header>
      <section>
        <p style={{ whiteSpace: "pre-wrap", margin: 0 }}>{note.content}</p>
      </section>
    </article>
  );
}
