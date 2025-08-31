"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { session as fetchSession, logout } from "@/lib/api/clientApi";
import { useAuthStore } from "@/lib/store/authStore";
import type { User } from "@/types/user"; // CHANGED: для type guard
import css from "./AuthProvider.module.css";

const isPrivatePath = (p: string) => p.startsWith("/profile") || p.startsWith("/notes");
const isAuthRoute = (p: string) => p === "/sign-in" || p === "/sign-up";

// CHANGED: Валидируем, что это действительно User
function isValidUser(u: unknown): u is User {
  return (
    !!u &&
    typeof u === "object" &&
    (typeof (u as any).email === "string" ||
      typeof (u as any).id === "string" ||
      typeof (u as any).userName === "string")
  );
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const rawPath = usePathname();
  const pathname = rawPath ?? "/"; // CHANGED: подстраховка
  const setUser = useAuthStore((s) => s.setUser);
  const clear = useAuthStore((s) => s.clearIsAuthenticated);

  const gated = useMemo(() => isPrivatePath(pathname), [pathname]);
  const authPage = useMemo(() => isAuthRoute(pathname), [pathname]);

  // CHANGED: показываем лоадер только на приватных маршрутах
  const [checking, setChecking] = useState(gated);

  useEffect(() => {
    let active = true;
    (async () => {
      // перезапускаем проверку при смене маршрута
      setChecking(gated);
      try {
        const candidate = await fetchSession();
        if (!active) return;

        if (isValidUser(candidate)) {
          setUser(candidate);
          if (authPage) router.replace("/profile"); // авторизован? уводим со /sign-(in|up)
        } else {
          if (gated) {
            await logout().catch(() => {});
            clear();
            router.replace("/sign-in");
          } else {
            clear();
          }
        }
      } finally {
        if (active) setChecking(false);
      }
    })();
    return () => {
      active = false;
    };
    // Именно от pathname (через gated/authPage) зависит проверка
  }, [pathname, gated, authPage, router, setUser, clear]);

  if (gated && checking) {
    return (
      <div className={css.loaderWrap}>
        <div className={css.loader} aria-label="loading" />
      </div>
    );
  }

  return <>{children}</>;
}
