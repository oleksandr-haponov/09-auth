"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { me } from "@/lib/api/clientApi";
import css from "./page.module.css";

export default function ProfilePage() {
  const { data } = useQuery({ queryKey: ["me"], queryFn: me, retry: false });

  const username = data?.username ?? "your_username";
  const email = data?.email ?? "your_email@example.com";

  return (
    <main className={css.mainContent}>
      <div className={css.profileCard}>
        <div className={css.header}>
          <h1 className={css.formTitle}>Profile Page</h1>
          <Link href="/profile/edit" className={css.editProfileButton} prefetch={false}>
            Edit Profile
          </Link>
        </div>

        <div className={css.avatarWrapper}>
          {/* Можно заменить на <Image /> и добавить remotePatterns при внешнем URL */}
          <img
            src={data?.avatarUrl || "/avatar.png"}
            alt="User Avatar"
            width={120}
            height={120}
            className={css.avatar}
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
