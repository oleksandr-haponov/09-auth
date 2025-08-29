"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSession, logout } from "@/lib/api/auth";
import AuthNavigation from "@/components/AuthNavigation/AuthNavigation";
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

  const handleLogout = () => mutLogout.mutate();

  return (
    <header className={css.header}>
      <Link href="/" className={css.brand ?? css.navigationLink} aria-label="Home">
        NoteHub
      </Link>

      {/* список навигации по требованиям ТЗ */}
      <ul className={css.navigation} aria-label="Main Navigation">
        <li className={css.navigationItem}>
          <Link href="/" prefetch={false} className={css.navigationLink}>
            Home
          </Link>
        </li>

        <li className={css.navigationItem}>
          <Link href="/notes" prefetch={false} className={css.navigationLink}>
            Notes
          </Link>
        </li>

        {/* блок аутентификации вынесен в отдельный компонент */}
        <AuthNavigation
          isAuthed={Boolean(user)}
          userEmail={user?.email ?? user?.name ?? null}
          onLogout={handleLogout}
        />
      </ul>
    </header>
  );
}
