// app/(auth routes)/sign-up/page.tsx
"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { register, type RegisterPayload } from "@/lib/api/clientApi";
import css from "./page.module.css";

export default function SignUpPage() {
  const router = useRouter();

  const { mutate, isPending } = useMutation({
    mutationFn: (p: RegisterPayload) => register(p),
    onSuccess: () => {
      // ТЗ: после успешной регистрации — редирект на /profile
      router.replace("/profile");
    },
  });

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") || "").trim();
    const password = String(fd.get("password") || "");
    if (!email || !password) return;
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
          <input id="password" type="password" name="password" className={css.input} required />
        </div>

        <div className={css.actions}>
          <button type="submit" className={css.submitButton} disabled={isPending}>
            Register
          </button>
        </div>
      </form>
    </main>
  );
}
