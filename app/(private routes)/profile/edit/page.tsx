"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import css from "./page.module.css";
import { me as getMe, updateMe } from "@/lib/api/clientApi";
import { useAuthStore } from "@/lib/store/authStore";
import type { User } from "@/types/user";

export default function ProfileEditPage() {
  const router = useRouter();
  const userFromStore = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  // локальная копия юзера (если уже есть в сторе — берём её)
  const [user, setUserLocal] = useState<User | null>(userFromStore ?? null);

  // ФОЛБЭК: если username нет — берём email (как на макете)
  const initialName = userFromStore?.username?.trim() || userFromStore?.email || "";

  const [username, setUsername] = useState<string>(initialName);
  const [saving, setSaving] = useState(false);

  // Если в сторе юзера ещё нет — подтянуть /users/me
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (userFromStore) return;
      try {
        const u = await getMe();
        if (!cancelled) {
          setUserLocal(u);
          setUser(u);
          const name = u.username?.trim() || u.email || "";
          setUsername(name);
        }
      } catch {
        // игнорируем — страница приватная и защищена middleware/AuthProvider
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userFromStore, setUser]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const next = username.trim();
    if (!next) return;

    setSaving(true);
    try {
      const updated = await updateMe({ username: next });
      setUser(updated);
      router.replace("/profile");
    } finally {
      setSaving(false);
    }
  }

  function onCancel() {
    router.replace("/profile");
  }

  return (
    <main className={css.mainContent}>
      <div className={css.profileCard}>
        <h1 className={css.formTitle}>Edit Profile</h1>

        <Image
          src={"/avatar.png"}
          alt="User Avatar"
          width={120}
          height={120}
          className={css.avatar}
          priority
        />

        <form className={css.profileInfo} onSubmit={onSubmit}>
          <div className={css.usernameWrapper}>
            <label htmlFor="username">Username:</label>
            <input
              id="username"
              type="text"
              className={css.input}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <p>Email: {user?.email ?? "user_email@example.com"}</p>

          <div className={css.actions}>
            <button type="submit" className={css.saveButton} disabled={saving}>
              Save
            </button>
            <button type="button" className={css.cancelButton} onClick={onCancel} disabled={saving}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
