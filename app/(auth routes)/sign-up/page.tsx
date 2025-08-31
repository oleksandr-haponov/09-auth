"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { register, type RegisterPayload } from "@/lib/api/clientApi";
import css from "./page.module.css";

function parseApiError(e: unknown): string {
  const err = e as {
    response?: { data?: { message?: string; errors?: unknown } };
    message?: string;
  };
  const base = err?.response?.data?.message || err?.message || "Registration failed";
  const errors = err?.response?.data?.errors;
  if (!errors) return String(base);
  if (Array.isArray(errors)) return `${base}: ${errors.join(", ")}`;
  if (typeof errors === "object") {
    const parts: string[] = [];
    for (const [k, v] of Object.entries(errors as Record<string, unknown>)) {
      parts.push(Array.isArray(v) ? `${k}: ${v.join(", ")}` : `${k}: ${String(v)}`);
    }
    return `${base}: ${parts.join("; ")}`;
  }
  return String(base);
}

export default function SignUpPage() {
  const [error, setError] = useState("");
  const [pendingData, setPendingData] = useState<RegisterPayload | null>(null); // ← rename
  const [showConfirm, setShowConfirm] = useState(false);

  const { mutate, isPending } = useMutation({
    mutationFn: (p: RegisterPayload) => register(p),
    onSuccess: () => {
      // остаёмся на /sign-up и просто закрываем модалку
      setShowConfirm(false);
      setPendingData(null); // ← очистим черновик
    },
    onError: (e) => setError(parseApiError(e)),
  });

  function openConfirm(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") || "").trim();
    const password = String(fd.get("password") || "");

    if (!email) return setError("Email is required");
    if (password.length < 8) return setError("Password must be at least 8 characters");

    setPendingData({ email, password });
    setShowConfirm(true);
  }

  function confirmRegister() {
    if (!pendingData || isPending) return; // ← защита от дабл-кликов
    mutate(pendingData);
  }

  return (
    <main className={css.mainContent}>
      <h1 className={css.formTitle}>Sign up</h1>

      {/* submit теперь только открывает модалку подтверждения */}
      <form className={css.form} onSubmit={openConfirm}>
        <div className={css.formGroup}>
          <label htmlFor="email">Email</label>
          <input id="email" type="email" name="email" className={css.input} required />
        </div>

        <div className={css.formGroup}>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            name="password"
            className={css.input}
            required
            minLength={8}
          />
        </div>

        <div className={css.actions}>
          <button type="submit" className={css.submitButton} disabled={isPending}>
            Register
          </button>
        </div>

        {error && <p className={css.error}>{error}</p>}
      </form>

      {/* Модалка подтверждения регистрации */}
      {showConfirm && (
        <div
          className={css.modalBackdrop}
          role="presentation"
          onClick={() => !isPending && setShowConfirm(false)}
        >
          <div
            className={css.modal}
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className={css.modalClose}
              aria-label="Close"
              onClick={() => setShowConfirm(false)}
              disabled={isPending}
            >
              ×
            </button>
            <h2 className={css.formTitle} style={{ marginBottom: 16 }}>
              Confirm registration
            </h2>
            <div className={css.actions}>
              <button
                type="button"
                className={css.submitButton}
                onClick={confirmRegister}
                disabled={isPending}
              >
                Register
              </button>
              <button
                type="button"
                className={css.cancelButton}
                onClick={() => setShowConfirm(false)}
                disabled={isPending}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
