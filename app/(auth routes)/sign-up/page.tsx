"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { register, type RegisterPayload } from "@/lib/api/clientApi";
import { useRouter } from "next/navigation";
import css from "./page.module.css";

export default function SignUpPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  const { mutate, isPending } = useMutation({
    mutationFn: (p: RegisterPayload) => register(p),
    onSuccess: () => {
      router.replace("/profile");
    },
    onError: (e: any) => {
      const msg = e?.response?.data?.message || e?.message || "Registration failed";
      setError(String(msg));
      // чтобы увидеть в консоли, что именно упало
      // console.error(e);
    },
  });

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") || "");
    const password = String(fd.get("password") || "");
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

        {/* показываем текст только при ошибке */}
        <p className={css.error}>{error}</p>
      </form>
    </main>
  );
}
