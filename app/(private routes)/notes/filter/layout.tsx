import React from "react";
import css from "../filter/layout.module.css"

type Props = {
  children: React.ReactNode;
  sidebar: React.ReactNode;
};

const NotesLayout = ({ children, sidebar }: Props) => {
  return (
    <section className={css.wrapper}>
      <aside className={css.aside}>{sidebar}</aside>
      <div className={css.content}> {children}</div>
    </section>
  );
};

export default NotesLayout;
