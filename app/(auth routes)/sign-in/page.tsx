"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { login, type LoginPayload } from "@/lib/api/auth";
import { useRouter } from "next/navigation";
import css from "./page.module.css";
export default function SignInPage() {
  const router = useRouter(); const qc = useQueryClient();
  const mut = useMutation({ mutationFn: (p: LoginPayload) => login(p), onSuccess: () => {
    qc.invalidateQueries({ queryKey: ["session"] }); router.push("/notes"); }});
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); const fd = new FormData(e.currentTarget);
    mut.mutate({ email: String(fd.get("email")||""), password: String(fd.get("password")||"") });
  };
  return (
    <main className={css.main}>
      <div className={css.container}>
        <h1 className={css.title}>Sign in</h1>
        <form onSubmit={onSubmit} className={css.form}>
          <input name="email" type="email" placeholder="Email" required className={css.input}/>
          <input name="password" type="password" placeholder="Password" required className={css.input}/>
          {mut.isError && <p className={css.error}>{(mut.error as Error)?.message ?? "Failed to sign in"}</p>}
          <button type="submit" className={css.submit} disabled={mut.isPending}>
            {mut.isPending ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}
