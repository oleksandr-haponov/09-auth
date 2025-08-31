"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { login, session as fetchSession, type Credentials } from "@/lib/api/clientApi";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";
import css from "./page.module.css";

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  const r = (err as { response?: { data?: { message?: string } } })?.response;
  return r?.data?.message || "Login failed";
}

export default function SignInClient({ initialEmail }: { initialEmail: string }) {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const isAuthed = useAuthStore((s) => s.isAuthenticated);

  const emailRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);

  const [error, setError] = useState("");
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const u = isAuthed ? null : await fetchSession().catch(() => null);
      if (!mounted) return;
      if (isAuthed || u) {
        if (u) setUser(u);
        setRedirecting(true);
        router.replace("/profile");
      } else if (initialEmail) {
        passwordRef.current?.focus();
      } else {
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
      setRedirecting(true);
      router.prefetch?.("/profile");
      router.replace("/profile");
    },
    onError: (err: unknown) => setError(getErrorMessage(err)),
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

  return (
    <main className={css.mainContent}>
      {redirecting ? (
        <div style={{ padding: 16 }}>Redirecting…</div>
      ) : (
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
      )}
    </main>
  );
}
