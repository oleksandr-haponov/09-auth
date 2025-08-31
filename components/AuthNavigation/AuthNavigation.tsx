"use client";

import { useRouter } from "next/navigation";
import { useState, useCallback, useEffect } from "react";
import { useAuthStore } from "@/lib/store/authStore";
import { logout } from "@/lib/api/clientApi";
import css from "./AuthNavigation.module.css";

export default function AuthNavigation() {
  const router = useRouter();

  // ⚠️ Чтобы SSR и первый клиентский рендер совпадали —
  // до маунта показываем гостевую навигацию.
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
          <a
            href="/profile"
            prefetch={"false" as any}
            className={css.navigationLink}
            suppressHydrationWarning
          >
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

  // Гостевая версия — рендерится и на сервере, и на первом клиентском рендере (=> без гидрации)
  return (
    <>
      <li className={css.navigationItem}>
        <a
          href="/sign-in"
          prefetch={"false" as any}
          className={css.navigationLink}
          suppressHydrationWarning
        >
          Login
        </a>
      </li>

      <li className={css.navigationItem}>
        <a
          href="/sign-up"
          prefetch={"false" as any}
          className={css.navigationLink}
          suppressHydrationWarning
        >
          Sign up
        </a>
      </li>
    </>
  );
}
