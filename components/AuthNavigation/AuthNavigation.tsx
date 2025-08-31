"use client";

import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import { useAuthStore } from "@/lib/store/authStore";
import { logout } from "@/lib/api/clientApi";
import css from "./AuthNavigation.module.css";

export default function AuthNavigation() {
  const router = useRouter();
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

  if (isAuthenticated) {
    return (
      <>
        <li className={css.navigationItem}>
          <a href="/profile" prefetch={false as any} className={css.navigationLink}>
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

  return (
    <>
      <li className={css.navigationItem}>
        <a href="/sign-in" prefetch={false as any} className={css.navigationLink}>
          Login
        </a>
      </li>

      <li className={css.navigationItem}>
        <a href="/sign-up" prefetch={false as any} className={css.navigationLink}>
          Sign up
        </a>
      </li>
    </>
  );
}
