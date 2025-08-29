"use client";

import Link from "next/link";
import css from "../Header/Header.module.css";

export interface AuthNavigationProps {
  isAuthed: boolean;
  userEmail?: string | null;
  onLogout?: () => void;
}

/**
 * Рендерит <li> элементы навигации для auth.
 * Ровно как в спецификации:
 *  - Profile (+ prefetch={false})
 *  - email + Logout
 *  - Login / Sign up (для неавторизованного)
 */
export default function AuthNavigation({ isAuthed, userEmail, onLogout }: AuthNavigationProps) {
  if (isAuthed) {
    return (
      <>
        <li className={css.navigationItem}>
          <Link href="/profile" prefetch={false} className={css.navigationLink}>
            Profile
          </Link>
        </li>

        <li className={css.navigationItem}>
          <p className={css.userEmail}>{userEmail ?? "User email"}</p>
          <button type="button" className={css.logoutButton} onClick={onLogout}>
            Logout
          </button>
        </li>
      </>
    );
  }

  return (
    <>
      <li className={css.navigationItem}>
        <Link href="/sign-in" prefetch={false} className={css.navigationLink}>
          Login
        </Link>
      </li>
      <li className={css.navigationItem}>
        <Link href="/sign-up" prefetch={false} className={css.navigationLink}>
          Sign up
        </Link>
      </li>
    </>
  );
}
