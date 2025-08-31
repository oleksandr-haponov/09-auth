import Link from "next/link";
import TagsMenu from "../TagsMenu/TagsMenu";
import { tags } from "@/types/note";
import css from "./Header.module.css";
import AuthNavigation from "../AuthNavigation/AuthNavigation";

export default async function Header() {

  return (
    <header className={css.header}>
      <Link className={css.headerLink} href="/" aria-label="Home">
        NoteHub
      </Link>
      <nav aria-label="Main Navigation">
        <ul className={css.navigation}>
          <li>
            <Link className={css.headerLink} href="/">
              Home
            </Link>
          </li>
          <li>
            <TagsMenu tags={tags} />
          </li>
          <li>
            <AuthNavigation />
          </li>
        </ul>
      </nav>
    </header>
  );
}
