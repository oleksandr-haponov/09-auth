// app/(private routes)/profile/page.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import css from "./page.module.css";
import { useAuthStore } from "@/lib/store/authStore";

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);

  const username = user?.username ?? user?.email ?? "your_username";
  const email = user?.email ?? "your_email@example.com";
  const avatarSrc = (user as any)?.avatar ?? (user as any)?.avatarUrl ?? "/avatar.png";

  return (
    <main className={css.mainContent}>
      <div className={css.profileCard}>
        <div className={css.header}>
          <h1 className={css.formTitle}>Profile Page</h1>
          <Link href="/profile/edit" prefetch={false} className={css.editProfileButton}>
            Edit Profile
          </Link>
        </div>

        <div className={css.avatarWrapper}>
          <Image
            src={avatarSrc}
            alt="User Avatar"
            width={120}
            height={120}
            className={css.avatar}
            priority
          />
        </div>

        <div className={css.profileInfo}>
          <p>Username: {username}</p>
          <p>Email: {email}</p>
        </div>
      </div>
    </main>
  );
}
