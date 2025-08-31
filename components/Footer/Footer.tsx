import css from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={css.footer}>
      <div className={css.content}>
        <p>© {new Date().getFullYear()} NoteHub. Отмучил.</p>
        <div className={css.wrap}>
          <p>Developer: Олександр Гапонов</p>
          <p>
            Contact us:
            <a href="mailto:olex.haponov@gmail.com">olex.haponov@gmail.com</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
