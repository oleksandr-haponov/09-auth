import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function PrivateGroupLayout({
  children,
  modal,
}: {
  children: ReactNode;
  modal: ReactNode;
}) {
  // Проверяем сессию через наш proxy-роут /api/auth/session
  // По ТЗ он возвращает 200 с объектом user ИЛИ 200 без тела (если неавторизован)
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

  const res = await fetch(`${base}/api/auth/session`, {
    headers: { cookie: cookies().toString() },
    cache: "no-store",
  });

  // Если ответ 200 без тела — считаем, что неавторизован
  let authed = false;
  if (res.ok) {
    const text = await res.text();
    authed = Boolean(text && text.trim() !== "");
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
