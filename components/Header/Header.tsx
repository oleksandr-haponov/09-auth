"use client";

import Link from "next/link";
import AuthNavigation from "@/components/AuthNavigation/AuthNavigation";
import TagsMenu from "@/components/TagsMenu/TagsMenu"; // ← ДОДАНО
import css from "./Header.module.css";

export default function Header() {
  return (
    <header className={css.header}>
      <Link href="/" className={css.brand ?? css.navigationLink} aria-label="Home">
        NoteHub
      </Link>

      <ul className={css.navigation} aria-label="Main Navigation">
        <li className={css.navigationItem}>
          <Link href="/" prefetch={false} className={css.navigationLink}>
            Home
          </Link>
        </li>

        {/* ЗАМІНА: замість лінку на /notes показуємо випадаючий список тегів */}
        <li className={css.navigationItem}>
          <TagsMenu />
        </li>

        <AuthNavigation />
      </ul>
    </header>
  );
}
