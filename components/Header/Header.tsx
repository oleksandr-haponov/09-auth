// components/Header/Header.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import AuthNavigation from "@/components/AuthNavigation/AuthNavigation";
import TagsMenu from "@/components/TagsMenu/TagsMenu";
import css from "./Header.module.css";

export default function Header() {
  const pathname = usePathname();
  const isAuthRoute = pathname === "/sign-in" || pathname === "/sign-up";

  return (
    <header className={css.header}>
      <Link href="/" className={css.brand} aria-label="Home">
        NoteHub
      </Link>

      <nav className={css.navigation} aria-label="Main Navigation">
        <ul className={css.navigationList}>
          <li className={css.navigationItem}>
            <Link href="/" prefetch={false} className={css.navigationLink}>
              Home
            </Link>
          </li>

          {/* Показываем TagsMenu на всех страницах, кроме auth (можно убрать условие, если нужно всегда) */}
          {!isAuthRoute && (
            <li className={css.navigationItem}>
              <TagsMenu />
            </li>
          )}

          {/* AuthNavigation сам отрендерит нужные <li> */}
          <AuthNavigation />
        </ul>
      </nav>
    </header>
  );
}
