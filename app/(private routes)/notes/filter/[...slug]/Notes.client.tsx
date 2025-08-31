"use client";

import { useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useDebouncedCallback } from "use-debounce";
import Pagination from "@/components/Pagination/Pagination";
import NoteList from "@/components/NoteList/NoteList";
import SearchBox from "@/components/SearchBox/SearchBox";
import Loader from "@/components/Loader/Loader";
import ErrorMessage from "@/components/ErrorMessage/ErrorMessage";
import { NoteTag } from "@/types/note";
import css from "./NotesClient.module.css";
import Link from "next/link";
import { NotesHttpResponse } from "@/types/note";
import { fetchNotes } from "@/lib/api/clientApi";

type NotesClientProps = {
  initialData: NotesHttpResponse;
  tag?: NoteTag | string;
};

export default function NotesClient({ initialData, tag }: NotesClientProps) {
  // стани (для пошуку searchQuery (стан пошуку))
  const [inputValue, setInputValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading, error, isError, isSuccess } = useQuery({
    queryKey: ["notes", tag, inputValue, currentPage],
    queryFn: () =>
      fetchNotes({
        tag: tag && tag !== "All" ? tag : undefined,
        search: inputValue,
        page: currentPage,
        ...(tag !== "All" && { tag }),
      }),
    placeholderData: keepPreviousData,
    initialData,
  });

  const changeInputValue = useDebouncedCallback((newQuery: string) => {
    setCurrentPage(1);
    setInputValue(newQuery);
  }, 300);

  const totalPages = data?.totalPages ?? 0;
  const notes = data?.notes ?? [];

  return (
    <>
      {}
      <div className={css.app}>
        <header className={css.toolbar}>
          <SearchBox onSearch={changeInputValue} />
          {isLoading && <Loader />}
          {isError && (
            <ErrorMessage
              message={error instanceof Error ? error.message : "Unknown error"}
            />
          )}
          {isSuccess && totalPages > 1 && (
            <Pagination
              page={currentPage}
              total={totalPages}
              onChange={setCurrentPage}
            />
          )}
          <Link href="/notes/action/create" className={css.button}>
            Create note +
          </Link>
        </header>
        {isSuccess && data?.notes?.length === 0 && (
          <div className={css.emptyState}>
            <p>No notes found for your request.</p>
          </div>
        )}
        {isSuccess && data?.notes && data?.notes.length > 0 && (
          <NoteList notes={notes} />
        )}
      </div>
    </>
  );
}
