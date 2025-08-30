import { NextRequest, NextResponse } from "next/server";
import { relay, upstream } from "../../_utils/utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(_req: NextRequest) {
  const res = await upstream("/auth/session", { method: "GET" });

  // Нормализуем поведение под ТЗ: если апстрим вернул 400/401/204 – значит сессии нет.
  if (res.status === 400 || res.status === 401 || res.status === 204) {
    return NextResponse.json(null, {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    });
  }

  return relay(res);
}
