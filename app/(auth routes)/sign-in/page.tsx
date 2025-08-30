"use client";

import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { login, session as fetchSession, type Credentials } from "@/lib/api/clientApi";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";
import css from "./page.module.css";

export default function SignInPage() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const isAuthed = useAuthStore((s) => s.isAuthenticated);
  const [error, setError] = useState("");

  // 1) если уже авторизован — уводим сразу
  useEffect(() => {
    if (isAuthed) {
      router.replace("/profile");
    }
  }, [isAuthed, router]);

  // 2) подстраховка: проверяем сессию на маунте (если Zustand пустой, но кука уже есть)
  useEffect(() => {
    (async () => {
      const u = await fetchSession();
      if (u) {
        setUser(u);
        router.replace("/profile");
      }
    })();
  }, [router, setUser]);

  const { mutate, isPending } = useMutation({
    mutationFn: (p: Credentials) => login(p),
    onSuccess: (user) => {
      setUser(user); // заполнить Zustand
      router.prefetch("/profile"); // микро-ускорение
      router.replace("/profile"); // и увести
    },
    onError: (e: any) => {
      const msg = e?.response?.data?.message || e?.message || "Login failed";
      setError(String(msg));
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
