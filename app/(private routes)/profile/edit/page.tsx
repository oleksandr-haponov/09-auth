"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import css from "./page.module.css";
import { me as fetchMe, updateMe } from "@/lib/api/clientApi";
import { useAuthStore } from "@/lib/store/authStore";
import type { User } from "@/types/user";

export default function ProfileEditPage() {
  const router = useRouter();
  const storeUser = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const [loading, setLoading] = useState<boolean>(!storeUser);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [username, setUsername] = useState<string>(
    storeUser?.username?.trim() || storeUser?.email || "",
  );
  const [email, setEmail] = useState<string>(storeUser?.email || "");
  const [avatar, setAvatar] = useState<string | undefined>(
    (storeUser as any)?.avatar || (storeUser as any)?.avatarUrl,
  );

  const initialUsername = useMemo(
    () => storeUser?.username?.trim() || storeUser?.email || "",
    [storeUser],
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (storeUser) {
        setLoading(false);
        return;
      }
      try {
        const me = await fetchMe();
        if (cancelled) return;
        setUser(me);
        setUsername(me.username?.trim() || me.email || "");
        setEmail(me.email);
        setAvatar((me as any)?.avatar || (me as any)?.avatarUrl);
      } catch {
        if (!cancelled) setError("Failed to load profile");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [storeUser, setUser]);

  const canSave = !saving && username.trim() && username.trim() !== initialUsername;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const next = username.trim();
    if (!next || !canSave) return;

    setSaving(true);
    try {
      const updated: User = await updateMe({ username: next });
      setUser(updated);
      router.replace("/profile");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
      setSaving(false);
    }
  }

  function onCancel() {
    router.push("/profile");
  }

  if (loading) {
    return <main className={css.mainContent}>Loading…</main>;
  }

  return (
    <main className={css.mainContent}>
      <div className={css.profileCard}>
        <h1 className={css.formTitle}>Edit Profile</h1>

        <Image
          src={avatar || "/avatar-placeholder.png"}
          alt="User Avatar"
          width={120}
          height={120}
          className={css.avatar}
          priority
        />

        <form className={css.profileInfo} onSubmit={onSubmit} aria-busy={saving}>
          <div className={css.usernameWrapper}>
            <label htmlFor="username">Username:</label>
            <input
              id="username"
              type="text"
              className={css.input}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
              disabled={saving}
            />
          </div>

          <p>Email: {email || "user_email@example.com"}</p>

          <div className={css.actions}>
            <button type="submit" className={css.saveButton} disabled={!canSave}>
              {saving ? "Saving…" : "Save"}
            </button>
            <button type="button" className={css.cancelButton} onClick={onCancel} disabled={saving}>
              Cancel
            </button>
          </div>

          {error && <p className={css.error}>{error}</p>}
        </form>
      </div>
    </main>
  );
}
