import { NextRequest, NextResponse } from "next/server";
import { upstream } from "../../_utils/utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type CookieOptions = {
  expires?: Date;
  maxAge?: number;
  path?: string;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: "lax" | "strict" | "none";
};

// Переносим Set-Cookie из апстрима в ответ и НЕ копируем Domain
function applySetCookie(response: NextResponse, setCookies: string[]) {
  for (const cookieStr of setCookies) {
    const parts = cookieStr.split(";").map((p) => p.trim());
    const [nameValue, ...attrs] = parts;
    const eqIdx = nameValue.indexOf("=");
    if (eqIdx < 0) continue;

    const name = nameValue.slice(0, eqIdx);
    const value = nameValue.slice(eqIdx + 1);

    const opts: CookieOptions = {};
    for (const raw of attrs) {
      const [kRaw, ...rest] = raw.split("=");
      const k = kRaw.toLowerCase();
      const v = rest.join("=");

      if (k === "path") opts.path = v || "/";
      else if (k === "expires") opts.expires = v ? new Date(v) : undefined;
      else if (k === "max-age") opts.maxAge = v ? Number(v) : undefined;
      // domain — игнорируем
      else if (k === "httponly") opts.httpOnly = true;
      else if (k === "secure") opts.secure = true;
      else if (k === "samesite") {
        const vv = v?.toLowerCase();
        if (vv === "lax" || vv === "strict" || vv === "none") opts.sameSite = vv;
      }
    }

    response.cookies.set(name, value, opts);
  }
}

export async function GET(_req: NextRequest) {
  const res = await upstream("/auth/session", { method: "GET" });

  // Нормализация: 400/401/204 -> 200 без тела (чтобы клиент не падал на 400)
  if (res.status === 400 || res.status === 401 || res.status === 204) {
    const resp = NextResponse.json(null, { status: 200 });
    resp.headers.set("Cache-Control", "no-store");
    return resp;
  }

  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const status = res.status;

  const resp = isJson
    ? NextResponse.json(await res.json().catch(() => ({})), { status })
    : new NextResponse(await res.text(), {
        status,
        headers: { "content-type": contentType || "text/plain; charset=utf-8" },
      });

  // Пробрасываем Set-Cookie (без Domain)
  const setCookieHeaderArray: string[] =
    ((res.headers as any).getSetCookie?.() as string[] | undefined) ??
    (res.headers.get("set-cookie") ? [res.headers.get("set-cookie") as string] : []);
  if (setCookieHeaderArray.length) applySetCookie(resp, setCookieHeaderArray);

  resp.headers.set("Cache-Control", "no-store");
  return resp;
}
