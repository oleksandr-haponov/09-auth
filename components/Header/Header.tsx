// components/Header/Header.tsx
"use client";

import Link from "next/link";
import AuthNavigation from "@/components/AuthNavigation/AuthNavigation";
import TagsMenu from "@/components/TagsMenu/TagsMenu";
import css from "./Header.module.css";

export default function Header() {
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
          <li className={css.navigationItem}>
            <TagsMenu /> {/* статическое меню, без сетевых запросов */}
          </li>
          <AuthNavigation />
        </ul>
      </nav>
    </header>
  );
}
