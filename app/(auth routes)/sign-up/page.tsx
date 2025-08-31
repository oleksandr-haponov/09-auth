"use client";

import { useEffect, useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { register, session as fetchSession, type RegisterPayload } from "@/lib/api/clientApi";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";
import css from "./page.module.css";

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  const r = (err as { response?: { data?: { message?: string }; status?: number } })?.response;
  const status = r?.status;
  const msg = r?.data?.message || "Registration failed";
  return status ? `${msg} (HTTP ${status})` : msg;
}

export default function SignUpPage() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const isAuthed = useAuthStore((s) => s.isAuthenticated);

  const [error, setError] = useState("");
  const [redirecting, setRedirecting] = useState(false);
  const emailRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const u = isAuthed ? null : await fetchSession().catch(() => null);
      if (!mounted) return;
      if (isAuthed || u) {
        if (u) setUser(u);
        setRedirecting(true);
        router.replace("/profile");
      } else {
        emailRef.current?.focus();
      }
    })();
    return () => {
      mounted = false;
    };
  }, [isAuthed, router, setUser]);

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (p: RegisterPayload) => register(p),
  });

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") || "").trim();
    const password = String(fd.get("password") || "").trim();
    if (!email || !password) return;

    try {
      await mutateAsync({ email, password });
      const fromSession = await fetchSession(); // гарантируем Set-Cookie
      if (fromSession) setUser(fromSession);
      setRedirecting(true);
      router.prefetch?.("/profile");
      router.replace("/profile");
    } catch (err: any) {
      const status = err?.response?.status as number | undefined;
      if (status === 409) {
        router.replace(`/sign-in?email=${encodeURIComponent(email)}`);
        return;
      }
      setError(getErrorMessage(err));
    }
  }

  return (
    <main className={css.mainContent}>
      <h1 className={css.formTitle}>Sign up</h1>

      {redirecting ? (
        <div style={{ padding: 16 }}>Redirecting…</div>
      ) : (
        <form className={css.form} onSubmit={onSubmit} aria-busy={isPending}>
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
              disabled={isPending}
              onInput={() => error && setError("")}
            />
          </div>

          <div className={css.formGroup}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              className={css.input}
              autoComplete="new-password"
              required
              disabled={isPending}
              onInput={() => error && setError("")}
            />
          </div>

          <div className={css.actions}>
            <button type="submit" className={css.submitButton} disabled={isPending}>
              {isPending ? "Registering…" : "Register"}
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
