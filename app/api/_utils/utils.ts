import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const UPSTREAM = "https://notehub-api.goit.study";
export const JAR_COOKIE = "__nh_proxy";

/** Прочитати наш «джар» із куками апстріма */
export function getJar(): string {
  return cookies().get(JAR_COOKIE)?.value ?? "";
}

/** Забрати set-cookie з апстріма і зберегти їх у наш джар */
export function setJarFromUpstream(res: Response) {
  // Next 14/15: headers.getSetCookie(); фолбек на raw
  // @ts-ignore
  const setCookies = res.headers.getSetCookie?.() ?? (res.headers as any).raw?.()["set-cookie"];
  const items: string[] = Array.isArray(setCookies) ? setCookies : setCookies ? [setCookies] : [];

  const pairs: string[] = [];
  for (const line of items) {
    const first = String(line).split(";")[0]; // name=value
    if (first.includes("=")) pairs.push(first.trim());
  }
  if (!pairs.length) return;

  cookies().set({
    name: JAR_COOKIE,
    value: pairs.join("; "),
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
  });
}

/** Запит до апстріма з автоматичним підкладанням cookie-jar */
export async function upstream(
  path: string,
  init?: RequestInit & { searchParams?: Record<string, string | number | undefined | null> },
): Promise<Response> {
  const url = new URL(UPSTREAM + path);
  if (init?.searchParams) {
    for (const [k, v] of Object.entries(init.searchParams)) {
      if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));
    }
  }

  const method = (init?.method || "GET").toUpperCase();
  const headers = new Headers(init?.headers);
  if (!headers.has("accept")) headers.set("accept", "application/json");
  if (!headers.has("content-type") && method !== "GET" && method !== "HEAD") {
    headers.set("content-type", "application/json");
  }

  const jar = getJar();
  if (jar) headers.set("cookie", jar);

  const res = await fetch(url.toString(), {
    ...init,
    headers,
    redirect: "manual",
  });

  setJarFromUpstream(res);
  return res;
}

/** Переслати відповідь апстріма як NextResponse (JSON/текст/бінарка) */
export async function relay(res: Response): Promise<NextResponse> {
  const ct = res.headers.get("content-type") ?? "";
  const init: ResponseInit = {
    status: res.status,
    headers: { "Cache-Control": "no-store" },
  };

  if (ct.includes("application/json")) {
    const text = await res.text();
    try {
      const json = text ? JSON.parse(text) : null;
      return NextResponse.json(json, init);
    } catch {
      return new NextResponse(text, { ...init, headers: { ...init.headers, "Content-Type": ct } });
    }
  }

  const buf = await res.arrayBuffer();
  return new NextResponse(buf, {
    ...init,
    headers: { ...init.headers, "Content-Type": ct || "application/octet-stream" },
  });
}
