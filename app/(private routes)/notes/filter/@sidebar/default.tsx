import Link from "next/link";
import {tags} from "@/types/note"
import css from "./SidebarNotes.module.css";

const NotesSidebar = async () => {

  return (
    <div>
      <ul className={css.menuList}>
        {/* список тегів */}
        {tags.map((tag) => (
          <li key={tag} className={css.menuItem}>
            <Link href={`/notes/filter/${tag}`} className={css.menuLink}>
              {tag}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NotesSidebar;
