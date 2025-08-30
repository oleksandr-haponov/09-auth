// app/(private routes)/profile/page.tsx
import type { Metadata } from "next";
import css from "./page.module.css";

export const metadata: Metadata = {
  title: "Profile Page | NoteHub",
  description: "User profile page",
  robots: { index: false, follow: false },
  openGraph: {
    title: "Profile Page | NoteHub",
    description: "User profile page",
    type: "website",
  },
};

export default function ProfilePage() {
  return (
    <main className={css.mainContent}>
      <div className={css.profileCard}>
        <div className={css.header}>
          <h1 className={css.formTitle}>Profile Page</h1>
          <a href="/profile/edit" className={css.editProfileButton}>
            Edit Profile
          </a>
        </div>

        <div className={css.avatarWrapper}>
          <img
            src="/avatar.png"
            alt="User Avatar"
            width={120}
            height={120}
            className={css.avatar}
          />
        </div>

        <div className={css.profileInfo}>
          <p>Username: your_username</p>
          <p>Email: your_email@example.com</p>
        </div>
      </div>
    </main>
  );
}
