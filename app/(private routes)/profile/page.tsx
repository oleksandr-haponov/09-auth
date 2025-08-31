import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getMeServer } from "@/lib/api/serverApi";
import css from "./page.module.css";

export const metadata: Metadata = {
  title: "Profile Page",
  description: "User profile with avatar, username and email",
  robots: { index: false, follow: false },
  openGraph: {
    title: "Profile Page",
    description: "User profile with avatar, username and email",
    type: "profile",
  },
  alternates: { canonical: "/profile" },
};

export default async function ProfilePage() {
  const cookieHeader = (await headers()).get("cookie") ?? undefined;

  let user: {
    email: string;
    username?: string | null;
    avatar?: string | null;
    avatarUrl?: string | null;
  };
  try {
    user = await getMeServer(cookieHeader);
  } catch {
    // если куки ещё не применились или сессия истекла — уводим на логин
    redirect("/sign-in");
  }

  const username = user.username || user.email || "your_username";
  const email = user.email || "your_email@example.com";
  const avatarSrc = user.avatar ?? user.avatarUrl ?? "/avatar-placeholder.png";

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
