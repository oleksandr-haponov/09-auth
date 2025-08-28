"use client";
import Link from "next/link";
import css from "./Header.module.css";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSession, logout } from "@/lib/api/auth";
export default function Header() {
  const qc = useQueryClient();
  const { data: user } = useQuery({ queryKey: ["session"], queryFn: getSession });
  const mutLogout = useMutation({ mutationFn: logout, onSuccess: () => qc.invalidateQueries({ queryKey: ["session"] }) });
  return (
    <header className={css.header}>
      <Link href="/" className={css.link}>NoteHub</Link>
      <nav className={css.nav} aria-label="Main">
        <Link href="/" className={css.link}>Home</Link>
        <Link href="/notes" className={css.link}>Notes</Link>
        {user ? (
          <>
            <span className={css.user}>Hello, {user.name || user.email}</span>
            <button className={css.button} onClick={() => mutLogout.mutate()}>Logout</button>
          </>
        ) : (
          <>
            <Link href="/sign-in" className={css.link}>Login</Link>
            <Link href="/sign-up" className={css.link}>Register</Link>
          </>
        )}
      </nav>
    </header>
  );
}
