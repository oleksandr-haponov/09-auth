"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMe, updateMe, type UpdateUserPayload } from "@/lib/api/auth";
import { useRouter } from "next/navigation";
import css from "./page.module.css";

export default function ProfilePage() {
  const router = useRouter();
  const qc = useQueryClient();

  // грузим профиль пользователя
  const { data: user, isLoading, isError, error } = useQuery({
    queryKey: ["me"],
    queryFn: getMe,
    retry: false,
  });

  // обновление имени
  const mut = useMutation({
    mutationFn: (payload: UpdateUserPayload) => updateMe(payload),
    onSuccess: (updated) => {
      // обновляем кэш профиля
      qc.setQueryData(["me"], updated);
      // заодно обновим сессию в хедере
      qc.invalidateQueries({ queryKey: ["session"] });
    },
  });

  if (isLoading) return <main className={css.mainContent}>Loading...</main>;
  if (isError) {
    return (
      <main className={css.mainContent}>
        <div className={css.profileCard}>
          <h1 className={css.formTitle}>Profile</h1>
          <p style={{ color: "#b91c1c" }}>
            {(error as Error)?.message ?? "Failed to load profile"}
          </p>
        </div>
      </main>
    );
  }
  if (!user) {
    // неавторизован — отправим на вход
    router.replace("/sign-in");
    return null;
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") || "").trim();
    if (name && name !== user.name) {
      mut.mutate({ name });
    }
  }

  return (
    <main className={css.mainContent}>
      <div className={css.profileCard}>
        <h1 className={css.formTitle}>Your Profile</h1>

        {/* Автар (если появится в API) — пока можно опустить */}
        {/* <img className={css.avatar} src={user.avatar ?? "/default-avatar.png"} width={120} height={120} alt="Avatar" /> */}

        <form onSubmit={onSubmit} className={css.profileInfo}>
          <div>
            <p><strong>Email:</strong> {user.email}</p>
          </div>

          <div className={css.usernameWrapper}>
            <label htmlFor="name">Display name</label>
            <input
              id="name"
              name="name"
              defaultValue={user.name || ""}
              placeholder="Your name"
              className={css.input}
            />
          </div>

          <div className={css.actions}>
            <button
              type="button"
              className={css.cancelButton}
              onClick={() => router.back()}
              disabled={mut.isPending}
            >
              Cancel
            </button>
            <button type="submit" className={css.saveButton} disabled={mut.isPending}>
              {mut.isPending ? "Saving..." : "Save"}
            </button>
          </div>

          {mut.isError && (
            <p style={{ color: "#b91c1c" }}>
              {(mut.error as Error)?.message ?? "Failed to update profile"}
            </p>
          )}
        </form>
      </div>
    </main>
  );
}
