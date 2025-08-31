"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import css from "./TagsMenu.module.css";

const TAGS = [
  "All",
  "Todo",
  "Work",
  "Events",
  "Personal",
  "Meeting",
  "Shopping",
  "Sport",
  "Traveling",
] as const;

export default function TagsMenu() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const handleDoc = (e: MouseEvent) => {
    if (!rootRef.current) return;
    if (!rootRef.current.contains(e.target as Node)) setOpen(false);
  };
  const handleKey = (e: KeyboardEvent) => {
    if (e.key === "Escape") setOpen(false);
  };

  useEffect(() => {
    if (!open) return;
    document.addEventListener("mousedown", handleDoc);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleDoc);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  // ВАЖНО: навигация программно, затем закрываем меню
  const goSignIn = (e?: React.SyntheticEvent) => {
    e?.preventDefault();
    router.push("/sign-in");
    setOpen(false);
  };

  return (
    <div className={css.menuContainer} ref={rootRef}>
      <button
        type="button"
        className={css.menuButton}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        Notes ▾
      </button>

      {open && (
        <ul className={css.menuList} role="menu" aria-label="Filter by tag">
          {TAGS.map((tag) => (
            <li key={tag} className={css.menuItem} role="none">
              <a
                href="/sign-in"
                className={css.menuLink}
                role="menuitem"
                onPointerDown={goSignIn} // навигация гарантированно срабатывает
                onClick={goSignIn} // fallback для клавиатуры
              >
                {tag}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
