import css from "./Footer.module.css";
export default function Footer() {
  return <footer className={css.footer}>© {new Date().getFullYear()} NoteHub</footer>;
}
