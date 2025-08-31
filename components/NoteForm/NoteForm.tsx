"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createNote } from "../../lib/api/clientApi";
import type { NewNoteData, NoteTag } from "../../types/note";
import { tags } from "../../types/note";
import { useId, useState } from "react";
import * as Yup from "yup";
import { useNoteDraftStore } from "../../lib/store/noteStore";
import { ValidationError } from "yup";
import { useRouter } from "next/navigation";
import css from "./NoteForm.module.css";

interface NoteFormProps {
  onClose: () => void; // якщо все добре, хочемо функцию, яка закриваэ модалку
}

const NoteSchema = Yup.object({
  title: Yup.string()
    .min(3, "Too Short!")
    .max(50, "Too Long!")
    .required("Required field"),
  content: Yup.string().max(500, "Too long"),
  tag: Yup.string()
    .oneOf(["Todo", "Work", "Personal", "Meeting", "Shopping"])
    .required("Required field"),
});

export default function NoteForm({ onClose }: NoteFormProps) {
  const fieldId = useId();
  const queryClient = useQueryClient();

  const [errors, setErrors] = useState<Record<string, string>>({});

  // zustand
  const { draft, setDraft, clearDraft } = useNoteDraftStore();

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setDraft({
      ...draft,
      [event.target.name]: event?.target.value,
    });
  };

  const router = useRouter();

  const { mutate, isPending } = useMutation({
    mutationFn: (noteData: NewNoteData) => createNote(noteData),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["notes"],
      });
      clearDraft();
      const tagToRedirect = draft.tag || "All";
      router.push(`/notes/filter/${tagToRedirect}`);
    },
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    // debugger;
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const note: NewNoteData = {
      title: formData.get("title")?.toString() || "",
      content: formData.get("content")?.toString() || "",
      tag: formData.get("tag")?.toString() as NoteTag,
    };

    try {
      const validatedData = await NoteSchema.validate(note, {
        abortEarly: false,
      });
      mutate(validatedData as NewNoteData);
    } catch (err) {
      if (err instanceof ValidationError) {
        const formErrors: Record<string, string> = {};
        err.inner.forEach((e) => {
          if (e.path) formErrors[e.path] = e.message;
        });
        setErrors(formErrors);
      }
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <>
      <form onSubmit={handleSubmit} className={css.form}>
        <div className={css.formGroup}>
          <label htmlFor={`${fieldId}-title`}>Title</label>
          <input
            value={draft?.title || ""}
            onChange={handleChange}
            id={`${fieldId}-title`}
            type="text"
            name="title"
            className={css.input}
          />
          {errors.title && <span className={css.error}>{errors.title}</span>}
        </div>

        <div className={css.formGroup}>
          <label htmlFor={`${fieldId}-content`}>Content</label>
          <textarea
            value={draft?.content || ""}
            onChange={handleChange}
            id={`${fieldId}-content`}
            name="content"
            rows={8}
            className={css.textarea}
          ></textarea>
          {errors.content && (
            <span className={css.error}>{errors.content}</span>
          )}
        </div>

        <div className={css.formGroup}>
          <label htmlFor={`${fieldId}tag`}>Tag</label>
          <select
            value={draft?.tag}
            onChange={handleChange}
            id={`${fieldId}tag`}
            name="tag"
            className={css.select}
          >
            {tags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
          {errors.tag && <span className={css.error}>{errors.tag}</span>}
        </div>

        <div className={css.actions}>
          <button
            type="button"
            className={css.cancelButton}
            onClick={handleCancel}
          >
            Cancel
          </button>
          <button type="submit" className={css.submitButton} disabled={false}>
            {isPending ? "Creating ..." : "Create note"}
          </button>
        </div>
      </form>
    </>
  );
}
