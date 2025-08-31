"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { checkSession, me as getMe, logout } from "@/lib/api/clientApi";
import { useAuthStore } from "@/lib/store/authStore";
import type { User } from "@/types/user";
import css from "./AuthProvider.module.css";

const isPrivate = (p: string) => p.startsWith("/profile") || p.startsWith("/notes");
const isAuthRoute = (p: string) => p === "/sign-in" || p === "/sign-up";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const setUser = useAuthStore((s) => s.setUser);
  const clear = useAuthStore((s) => s.clearIsAuthenticated);

  const gated = useMemo(() => isPrivate(pathname), [pathname]);
  const authPage = useMemo(() => isAuthRoute(pathname), [pathname]);

  const [checking, setChecking] = useState(gated);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!gated && !authPage) return; // перевіряємо тільки там, де потрібно
      setChecking(gated);
      try {
        const ok = await checkSession(); // ← OAS: просто оновлює токени, без User
        if (!active) return;

        if (ok) {
          // отримуємо користувача з /users/me
          const u: User = await getMe();
          if (!active) return;
          setUser(u);
          if (authPage) router.replace("/profile"); // авторизований не повинен бачити /sign-*
        } else {
          // неавторизований
          await logout().catch(() => {});
          clear();
          if (gated) router.replace("/sign-in");
        }
      } finally {
        if (active) setChecking(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [gated, authPage, pathname, setUser, clear, router]);

  if (gated && checking) {
    return (
      <div className={css.loaderWrap}>
        <div className={css.loader} aria-label="loading" />
      </div>
    );
  }

  return <>{children}</>;
}
