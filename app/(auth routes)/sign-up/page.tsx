"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { register, type RegisterPayload } from "@/lib/api/auth";
import { useRouter } from "next/navigation";
import css from "./page.module.css";

export default function SignUpPage() {
  const router = useRouter();
  const qc = useQueryClient();

  const mut = useMutation({
    mutationFn: (p: RegisterPayload) => register(p),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["session"] });
      router.push("/notes");
    },
  });

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    mut.mutate({
      name: String(fd.get("name") || ""),
      email: String(fd.get("email") || ""),
      password: String(fd.get("password") || ""),
    });
  }

  return (
    <main className={css.mainContent}>
      <form onSubmit={onSubmit} className={css.form}>
        <h1 className={css.formTitle}>Sign up</h1>

        <label className={css.formGroup}>
          Name
          <input name="name" required className={css.input} placeholder="Your name" />
        </label>

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
          <p className={css.error}>{(mut.error as Error)?.message ?? "Failed to sign up"}</p>
        )}

        <div className={css.actions}>
          <button type="submit" className={css.submitButton} disabled={mut.isPending}>
            {mut.isPending ? "Creating..." : "Create account"}
          </button>
        </div>
      </form>
    </main>
  );
}
