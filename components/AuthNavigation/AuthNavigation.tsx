"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useCallback, useEffect } from "react";
import { useAuthStore } from "@/lib/store/authStore";
import { logout } from "@/lib/api/clientApi";
import css from "./AuthNavigation.module.css";

export default function AuthNavigation() {
  const router = useRouter();

  // выравниваем SSR/CSR — до маунта показываем гостевой вариант
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const userEmail = useAuthStore((s) => s.user?.email);
  const clearIsAuthenticated = useAuthStore((s) => s.clearIsAuthenticated);

  const [pending, setPending] = useState(false);

  const onLogout = useCallback(async () => {
    if (pending) return;
    setPending(true);
    try {
      await logout();
    } finally {
      clearIsAuthenticated();
      router.replace("/sign-in");
    }
  }, [pending, clearIsAuthenticated, router]);

  const showAuthed = mounted && isAuthenticated;

  if (showAuthed) {
    return (
      <>
        <li className={css.navigationItem}>
          <Link href="/profile" prefetch={false} className={css.navigationLink}>
            Profile
          </Link>
        </li>

        <li className={css.navigationItem}>
          <p className={css.userEmail}>{userEmail ?? "User email"}</p>
          <button
            type="button"
            className={css.logoutButton}
            onClick={onLogout}
            disabled={pending}
            aria-disabled={pending}
          >
            Logout
          </button>
        </li>
      </>
    );
  }

  // Гостевая версия
  return (
    <>
      <li className={css.navigationItem}>
        <Link href="/sign-in" prefetch={false} className={css.navigationLink}>
          Login
        </Link>
      </li>

      <li className={css.navigationItem}>
        <Link href="/sign-up" prefetch={false} className={css.navigationLink}>
          Sign up
        </Link>
      </li>
    </>
  );
}
