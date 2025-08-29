"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { login, type LoginPayload } from "@/lib/api/auth";
import { useRouter } from "next/navigation";
import css from "./page.module.css";

export default function SignInPage() {
  const router = useRouter();
  const qc = useQueryClient();

  const mut = useMutation({
    mutationFn: (p: LoginPayload) => login(p),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["session"] });
      router.push("/notes");
    },
  });

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    mut.mutate({
      email: String(fd.get("email") || ""),
      password: String(fd.get("password") || ""),
    });
  }

  return (
    <main className={css.mainContent}>
      <form onSubmit={onSubmit} className={css.form}>
        <h1 className={css.formTitle}>Sign in</h1>

        <label className={css.formGroup}>
          Email
          <input
            name="email"
            type="email"
            required
            className={css.input}
            placeholder="you@example.com"
          />
        </label>

        <label className={css.formGroup}>
          Password
          <input
            name="password"
            type="password"
            required
            className={css.input}
            placeholder="••••••••"
          />
        </label>

        {mut.isError && (
          <p className={css.error}>{(mut.error as Error)?.message ?? "Failed to sign in"}</p>
        )}

        <div className={css.actions}>
          <button type="submit" className={css.submitButton} disabled={mut.isPending}>
            {mut.isPending ? "Signing in..." : "Sign in"}
          </button>
        </div>
      </form>
    </main>
  );
}
