"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getSession, logout } from "@/lib/api/clientApi";
import { useAuthStore } from "@/lib/store/authStore";
import css from "./AuthProvider.module.css";

const PRIVATE_PREFIXES = ["/profile", "/notes"] as const;
const AUTH_ROUTES = ["/sign-in", "/sign-up"] as const;

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";
  const router = useRouter();

  const setUser = useAuthStore((s) => s.setUser);
  const clear = useAuthStore((s) => s.clearIsAuthenticated);

  const isPrivate = useMemo(() => {
    // /profile и /profile/...; /notes и /notes/...
    return PRIVATE_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));
  }, [pathname]);

  const isAuthRoute = useMemo(
    () => AUTH_ROUTES.includes(pathname as (typeof AUTH_ROUTES)[number]),
    [pathname],
  );

  const [checking, setChecking] = useState<boolean>(isPrivate);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      // Проверяем только auth/private маршруты
      if (!isPrivate && !isAuthRoute) return;

      setChecking(isPrivate);
      try {
        // /api/auth/session: 200 c объектом -> User; 200 без тела/401 -> null
        const user = await getSession();
        if (cancelled) return;

        if (user) {
          setUser(user);
          // Авторизованному на /sign-in|/sign-up делать нечего
          if (isAuthRoute) router.replace("/profile");
        } else {
          // Нет сессии — приводим клиент в чистое состояние
          try {
            await logout(); // игнорируем 401/прочее
          } catch {}
          clear();
          if (isPrivate) router.replace("/sign-in");
        }
      } finally {
        if (!cancelled) setChecking(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [isPrivate, isAuthRoute, pathname, setUser, clear, router]);

  if (isPrivate && checking) {
    return (
      <div className={css.loaderWrap}>
        <div className={css.loader} aria-label="loading" />
      </div>
    );
  }

  return <>{children}</>;
}
