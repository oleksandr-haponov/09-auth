"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSession, logout } from "@/lib/api/auth";
import css from "./Header.module.css";

export default function Header() {
  const qc = useQueryClient();
  const { data: user } = useQuery({
    queryKey: ["session"],
    queryFn: getSession,
  });

  const mutLogout = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["session"] });
    },
  });

  return (
    <header className={css.header}>
      <Link href="/" className={css.brand} aria-label="Home">
        NoteHub
      </Link>

      <nav className={css.navigation} aria-label="Main Navigation">
        <div className={css.navigationItem}>
          <Link href="/" className={css.navigationLink}>
            Home
          </Link>
        </div>
        <div className={css.navigationItem}>
          <Link href="/notes" className={css.navigationLink}>
            Notes
          </Link>
        </div>

        {user ? (
          <>
            <div className={css.navigationItem}>
              <span className={css.userEmail}>{user.name || user.email}</span>
            </div>
            <div className={css.navigationItem}>
              <button
                type="button"
                className={css.logoutButton}
                onClick={() => mutLogout.mutate()}
                disabled={mutLogout.isPending}
              >
                {mutLogout.isPending ? "Logging out..." : "Logout"}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className={css.navigationItem}>
              <Link href="/sign-in" className={css.navigationLink}>
                Login
              </Link>
            </div>
            <div className={css.navigationItem}>
              <Link href="/sign-up" className={css.navigationLink}>
                Register
              </Link>
            </div>
          </>
        )}
      </nav>
    </header>
  );
}
