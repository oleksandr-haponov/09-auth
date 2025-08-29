"use client";

import { useEffect, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getMe, updateMe, type UpdateUserPayload } from "@/lib/api/auth";
import { useRouter } from "next/navigation";
import css from "./page.module.css";

export default function ProfilePage() {
  const router = useRouter();
  const qc = useQueryClient();

  // Загружаем профиль
  const {
    data: user,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["me"],
    queryFn: getMe,
    retry: false,
  });

  // Мутация обновления профиля
  const mut = useMutation({
    mutationFn: (payload: UpdateUserPayload) => updateMe(payload),
    onSuccess: (updated) => {
      // Обновляем кеш профиля
      qc.setQueryData(["me"], updated);
      // Обновим сессию в хедере
      qc.invalidateQueries({ queryKey: ["session"] });
    },
  });

  // Если неавторизован — отправляем на Sign in
  useEffect(() => {
    if (!isLoading && !isError && user == null) {
      router.replace("/sign-in");
    }
  }, [isLoading, isError, user, router]);

  const errorMessage = useMemo(
    () => (error instanceof Error ? error.message : "Failed to load profile"),
    [error],
  );

  if (isLoading) {
    return (
      <main className={css.mainContent}>
        <p>Loading, please wait...</p>
      </main>
    );
  }

  if (isError) {
    return (
      <main className={css.mainContent}>
        <div className={css.profileCard}>
          <h1 className={css.formTitle}>Profile</h1>
          <p style={{ color: "#b91c1c" }}>{errorMessage}</p>
        </div>
      </main>
    );
  }

  // user === null: уже редиректим выше
  if (!user) return null;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") || "").trim();

    // Нечего сохранять
    if (!name || name === (user.name ?? "")) return;

    mut.mutate({ name });
  }

  return (
    <main className={css.mainContent}>
      <div className={css.profileCard}>
        <h1 className={css.formTitle}>Your Profile</h1>

        {/* Можно добавить аватар позже, если появится в API */}
        {/* <img className={css.avatar} src="/avatar.png" width={120} height={120} alt="Avatar" /> */}

        <form onSubmit={onSubmit} className={css.profileInfo}>
          <p>
            <strong>Email:</strong> {user.email}
          </p>

          <div className={css.usernameWrapper}>
            <label htmlFor="name">Display name</label>
            <input
              id="name"
              name="name"
              defaultValue={user.name ?? ""}
              placeholder="Your name"
              className={css.input}
            />
          </div>

          {mut.isError && (
            <p style={{ color: "#b91c1c" }}>
              {(mut.error as Error)?.message ?? "Failed to update profile"}
            </p>
          )}

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
        </form>
      </div>
    </main>
  );
}
