"use client";
import { useRouter } from "next/navigation";
import NoteForm from "@/components/NoteForm/NoteForm";
import css from "../CreateNote/CreateNote.module.css";

export default function CreateNote() {
  const router = useRouter();

  const handleClose = () => {
    router.push("/notes/filter/All"); // або назад
  };

  return (
    <main className={css.main}>
      <div className={css.container}>
        <h1 className={css.title}>Create note</h1>
        <NoteForm onClose={handleClose} />
      </div>
    </main>
  );
}