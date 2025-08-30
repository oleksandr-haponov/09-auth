"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { session as fetchSession, logout } from "@/lib/api/clientApi";
import { useAuthStore } from "@/lib/store/authStore";
import css from "./AuthProvider.module.css";

const isPrivate = (p: string) => p.startsWith("/profile") || p.startsWith("/notes");

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);
  const setUser = useAuthStore((s) => s.setUser);
  const clear = useAuthStore((s) => s.clearIsAuthenticated);
  const gated = useMemo(() => isPrivate(pathname), [pathname]);

  useEffect(() => {
    let active = true;
    (async () => {
      setChecking(true);
      try {
        const user = await fetchSession();
        if (!active) return;
        if (user) {
          setUser(user);
        } else if (gated) {
          await logout().catch(() => {});
          clear();
          router.replace("/sign-in");
        } else {
          clear();
        }
      } finally {
        if (active) setChecking(false);
      }
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  if (gated && checking) {
    return (
      <div className={css.loaderWrap}>
        <div className={css.loader} aria-label="loading" />
      </div>
    );
  }

  return <>{children}</>;
}
