"use client";

import { useRouter } from "next/navigation";
import { useState, useCallback, useEffect } from "react";
import { useAuthStore } from "@/lib/store/authStore";
import { logout } from "@/lib/api/clientApi";
import css from "./AuthNavigation.module.css";

export default function AuthNavigation() {
  const router = useRouter();

  // до маунта показываем гостевую навигацию, чтобы SSR == 1-й клиентский рендер
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
          <a href="/profile" className={css.navigationLink} suppressHydrationWarning>
            Profile
          </a>
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
        <a href="/sign-in" className={css.navigationLink} suppressHydrationWarning>
          Login
        </a>
      </li>

      <li className={css.navigationItem}>
        <a href="/sign-up" className={css.navigationLink} suppressHydrationWarning>
          Sign up
        </a>
      </li>
    </>
  );
}
