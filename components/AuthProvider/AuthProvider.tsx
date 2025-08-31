"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { checkSession, me as getMe, logout } from "@/lib/api/clientApi";
import { useAuthStore } from "@/lib/store/authStore";
import type { User } from "@/types/user";
import css from "./AuthProvider.module.css";

const PRIVATE_PREFIXES = ["/profile", "/notes"];
const AUTH_ROUTES = ["/sign-in", "/sign-up"];

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";
  const router = useRouter();

  const setUser = useAuthStore((s) => s.setUser);
  const clear = useAuthStore((s) => s.clearIsAuthenticated);

  const isPrivate = useMemo(() => PRIVATE_PREFIXES.some((p) => pathname.startsWith(p)), [pathname]);
  const isAuthRoute = useMemo(() => AUTH_ROUTES.includes(pathname), [pathname]);

  const [checking, setChecking] = useState(isPrivate);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      // проверяем только там, где нужно
      if (!isPrivate && !isAuthRoute) return;

      setChecking(isPrivate);
      try {
        const ok = await checkSession(); // дергает /api/auth/session (нормализовано)
        if (cancelled) return;

        if (ok) {
          // сессия валидна → получаем юзера
          const u: User = await getMe();
          if (cancelled) return;
          setUser(u);

          // авторизованному не показываем /sign-in, /sign-up
          if (isAuthRoute) router.replace("/profile");
        } else {
          // сессии нет
          await logout().catch(() => {});
          clear();
          if (isPrivate) router.replace("/sign-in");
        }
      } finally {
        if (!cancelled) setChecking(false);
      }
    }

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
