"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { register, type RegisterPayload } from "@/lib/api/clientApi";
import { useRouter } from "next/navigation";
import css from "./page.module.css";

function parseApiError(e: any): string {
  const res = e?.response;
  const base = res?.data?.message || e?.message || "Registration failed";
  const errors = res?.data?.errors;

  if (!errors) return String(base);

  if (Array.isArray(errors)) {
    return `${base}: ${errors.join(", ")}`;
  }
  if (typeof errors === "object") {
    const parts: string[] = [];
    for (const [k, v] of Object.entries(errors)) {
      if (Array.isArray(v)) parts.push(`${k}: ${(v as string[]).join(", ")}`);
      else parts.push(`${k}: ${String(v)}`);
    }
    return `${base}: ${parts.join("; ")}`;
  }
  return String(base);
}

export default function SignUpPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  const { mutate, isPending } = useMutation({
    mutationFn: (p: RegisterPayload) => register(p),
    onSuccess: () => {
      router.replace("/profile");
    },
    onError: (e) => {
      setError(parseApiError(e));
    },
  });

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") || "").trim();
    const password = String(fd.get("password") || "");

    // Клиентская валидация под типичные требования бэка
    if (!email) return setError("Email is required");
    if (password.length < 8) return setError("Password must be at least 8 characters");

    mutate({ email, password });
  }

  return (
    <main className={css.mainContent}>
      <h1 className={css.formTitle}>Sign up</h1>

      <form className={css.form} onSubmit={onSubmit}>
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

        {/* CHANGED: статичний текст відповідно до ТЗ */}
        <p className={css.error}>Error</p>
      </form>
    </main>
  );
}
