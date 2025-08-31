"use client";

import { useEffect, useState } from "react";
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
        }
      } catch {}
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
      const created = await mutateAsync({ email, password });
      // важный шаг: валидируем/рефрешим сессию, чтобы куки точно были к серверному рендеру /profile
      const fromSession = await fetchSession();
      setUser(fromSession ?? created);
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

  if (isAuthed) return null;

  return (
    <main className={css.mainContent}>
      <h1 className={css.formTitle}>Sign up</h1>
      <form className={css.form} onSubmit={onSubmit} aria-busy={isPending}>
        <div className={css.formGroup}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            name="email"
            className={css.input}
            autoComplete="username"
            required
            autoFocus
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
    </main>
  );
}
