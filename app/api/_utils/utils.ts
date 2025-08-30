import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const UPSTREAM = "https://notehub-api.goit.study";
export const JAR_COOKIE = "__nh_proxy";

/** Прочитати наш «джар» із куками апстріма (async у Next 15) */
export async function getJar(): Promise<string> {
  const ck = await cookies();
  return ck.get(JAR_COOKIE)?.value ?? "";
}

/** Забрати set-cookie з апстріма і зберегти їх у наш джар */
export async function setJarFromUpstream(res: Response) {
  // безопасно получаем список Set-Cookie
  const setCookies =
    (res as any).headers?.getSetCookie?.() ??
    (res.headers as any).get?.("set-cookie") ??
    (res.headers as any).raw?.()["set-cookie"];

  const list: string[] = Array.isArray(setCookies) ? setCookies : setCookies ? [setCookies] : [];

  const pairs: string[] = [];
  for (const line of list) {
    const first = String(line).split(";")[0]; // name=value
    if (first.includes("=")) pairs.push(first.trim());
  }
  if (!pairs.length) return;

  const ck = await cookies();
  ck.set({
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

  const jar = await getJar();
  if (jar) headers.set("cookie", jar);

  const res = await fetch(url.toString(), {
    ...init,
    headers,
    redirect: "manual",
  });

  await setJarFromUpstream(res);
  return res;
}

/** Переслати відповідь апстріма як NextResponse */
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
