"use client";

import Image from "next/image";
import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { me, updateMe } from "@/lib/api/clientApi";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";
import css from "./page.module.css";

export default function EditProfilePage() {
  const router = useRouter();
  const qc = useQueryClient();
  const { user, setUser } = useAuthStore();

  const { data } = useQuery({
    queryKey: ["me"],
    queryFn: me,
    staleTime: 0,
    gcTime: 0,
  });

  useEffect(() => {
    if (data) setUser(data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.id, data?.email, data?.username]);

  const current = data ?? user ?? null;

  const { mutate, isPending } = useMutation({
    mutationFn: (p: { username: string }) => updateMe(p),
    onSuccess: (updated) => {
      setUser(updated);
      qc.invalidateQueries({ queryKey: ["me"] });
      router.replace("/profile");
    },
  });

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const username = String(fd.get("username") || "");
    mutate({ username });
  }

  return (
    <main className={css.mainContent}>
      <div className={css.profileCard}>
        <h1 className={css.formTitle}>Edit Profile</h1>

        <Image
          src={current?.avatarUrl || "/avatar.png"}
          alt="User Avatar"
          width={120}
          height={120}
          className={css.avatar}
        />

        <form className={css.profileInfo} onSubmit={onSubmit}>
          <div className={css.usernameWrapper}>
            <label htmlFor="username">Username:</label>
            <input
              id="username"
              type="text"
              className={css.input}
              defaultValue={current?.username || ""}
              required
              disabled={isPending}
            />
          </div>

          <p>Email: {current?.email || "user_email@example.com"}</p>

          <div className={css.actions}>
            <button type="submit" className={css.saveButton} disabled={isPending}>
              Save
            </button>
            <button
              type="button"
              className={css.cancelButton}
              onClick={() => router.back()}
              disabled={isPending}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
