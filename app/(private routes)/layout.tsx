// app/(private routes)/layout.tsx
import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { noStore } from "next/cache";

// (на всякий) делаем контент всегда динамическим
export const revalidate = 0;

export default async function PrivateGroupLayout({
  children,
  modal,
}: {
  children: ReactNode;
  modal: ReactNode;
}) {
  // этот layout выполняется на сервере; отключаем кеш
  noStore();

  let authed = false;

  try {
    // Внутренний fetch на наш proxy-роут
    const res = await fetch("/api/auth/session", {
      headers: { cookie: cookies().toString() },
      cache: "no-store",
    });

    if (res.ok) {
      const text = await res.text(); // по ТЗ: user-JSON или пустое тело
      authed = Boolean(text && text.trim() !== "");
    }
  } catch {
    // если сеть/прокси упали, считаем неавторизованным
    authed = false;
  }

  if (!authed) {
    redirect("/sign-in");
  }

  return (
    <>
      {children}
      {modal}
    </>
  );
}
