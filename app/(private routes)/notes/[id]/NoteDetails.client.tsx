"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { fetchNoteById } from "@/lib/api/clientApi";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import css from "./NoteDetailsClient.module.css";

const NoteDetailsClient = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [formattedDate, setFormattedDate] = useState<string | null>(null);

  const {
    data: note,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["note", id],
    queryFn: () => fetchNoteById(id),
    refetchOnMount: false,
  });

  // Преобразуем дату только на клиенте
  useEffect(() => {
    if (note) {
      const date = new Date(note.createdAt);
      setFormattedDate(date.toLocaleString());
    }
  }, [note]);

  if (isLoading) {
    return <p>Loading, please wait...</p>;
  }

  if (error || !note) {
    return <p>Something went wrong.</p>;
  }

  const handleGoBack = () => {
    const isSure = confirm(" Are you sure?");
    if (isSure) {
      router.back();
    }
  };

  return (
    <div className={css.container}>
      <div className={css.item}>
        <button className={css.backBtn} onClick={handleGoBack}>
          Back
        </button>
        <div className={css.header}>
          <h2>{note?.title}</h2>
        </div>
        <p className={css.content}>{note?.content}</p>
        <p className={css.date}>Created: {formattedDate}</p>
      </div>
    </div>
  );
};

export default NoteDetailsClient;
