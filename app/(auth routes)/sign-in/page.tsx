"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { login, session as fetchSession, type Credentials } from "@/lib/api/clientApi";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";
import css from "./page.module.css";

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  const r = (err as { response?: { data?: { message?: string } } })?.response;
  return r?.data?.message || "Login failed";
}

export default function SignInPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const initialEmail = sp.get("email") ?? "";

  const emailRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);

  const setUser = useAuthStore((s) => s.setUser);
  const isAuthed = useAuthStore((s) => s.isAuthenticated);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (isAuthed) {
        router.replace("/profile");
        return;
      }
      try {
        const u = await fetchSession();
        if (!mounted) return;
        if (u) {
          setUser(u);
          router.replace("/profile");
        } else if (initialEmail) {
          // если имейл пришёл из /sign-up (409) — фокус на пароль
          passwordRef.current?.focus();
        } else {
          emailRef.current?.focus();
        }
      } catch {
        emailRef.current?.focus();
      }
    })();
    return () => {
      mounted = false;
    };
  }, [isAuthed, router, setUser, initialEmail]);

  const { mutate, isPending } = useMutation({
    mutationFn: (p: Credentials) => login(p),
    onSuccess: (user) => {
      setUser(user);
      router.prefetch?.("/profile");
      router.replace("/profile");
    },
    onError: (err: unknown) => {
      setError(getErrorMessage(err));
    },
  });

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    mutate({
      email: String(fd.get("email") || "").trim(),
      password: String(fd.get("password") || "").trim(),
    });
  }

  if (isAuthed) return null;

  return (
    <main className={css.mainContent}>
      <form className={css.form} onSubmit={onSubmit} aria-busy={isPending}>
        <h1 className={css.formTitle}>Sign in</h1>

        <div className={css.formGroup}>
          <label htmlFor="email">Email</label>
          <input
            ref={emailRef}
            id="email"
            type="email"
            name="email"
            className={css.input}
            autoComplete="username"
            required
            defaultValue={initialEmail}
            disabled={isPending}
            onInput={() => error && setError("")}
          />
        </div>

        <div className={css.formGroup}>
          <label htmlFor="password">Password</label>
          <input
            ref={passwordRef}
            id="password"
            type="password"
            name="password"
            className={css.input}
            autoComplete="current-password"
            required
            disabled={isPending}
            onInput={() => error && setError("")}
          />
        </div>

        <div className={css.actions}>
          <button type="submit" className={css.submitButton} disabled={isPending}>
            {isPending ? "Logging in…" : "Log in"}
          </button>
        </div>

        <p className={css.error} aria-live="polite">
          {error}
        </p>
      </form>
    </main>
  );
}
