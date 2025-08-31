// app/(auth routes)/sign-in/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { login, session as fetchSession, type Credentials } from "@/lib/api/clientApi";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";
import css from "./page.module.css";

// безопасный парсер сообщения об ошибке без any
function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  const r = (err as { response?: { data?: { message?: string } } })?.response;
  return r?.data?.message || "Login failed";
}

export default function SignInPage() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const isAuthed = useAuthStore((s) => s.isAuthenticated);
  const [error, setError] = useState("");

  // если уже авторизованы — редирект; иначе пробуем подтянуть сессию
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
      } catch {
        // ignore
      }
    })();
    return () => {
      mounted = false;
    };
  }, [isAuthed, router, setUser]);

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
      email: String(fd.get("email") || ""),
      password: String(fd.get("password") || ""),
    });
  }

  // Гард: если уже авторизованы — ничего не рендерим, чтобы окно логина не "висело"
  if (isAuthed) return null;

  return (
    <main className={css.mainContent}>
      <form className={css.form} onSubmit={onSubmit}>
        <h1 className={css.formTitle}>Sign in</h1>

        <div className={css.formGroup}>
          <label htmlFor="email">Email</label>
          <input id="email" type="email" name="email" className={css.input} required />
        </div>

        <div className={css.formGroup}>
          <label htmlFor="password">Password</label>
          <input id="password" type="password" name="password" className={css.input} required />
        </div>

        <div className={css.actions}>
          <button type="submit" className={css.submitButton} disabled={isPending}>
            Log in
          </button>
        </div>

        <p className={css.error}>{error}</p>
      </form>
    </main>
  );
}
