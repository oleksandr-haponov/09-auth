// middleware.ts
import { NextRequest, NextResponse } from "next/server";

const PRIVATE_PREFIXES = ["/profile", "/notes"] as const;

function isPrivatePath(pathname: string): boolean {
  return PRIVATE_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

/** Перекладываем Set-Cookie из ответа session в наш ответ (Domain игнорируем) */
function applySetCookieStrings(resp: NextResponse, setCookies: string[]) {
  for (const cookieStr of setCookies) {
    if (!cookieStr) continue;
    const parts = cookieStr.split(";").map((p) => p.trim());
    const [nameValue, ...attrs] = parts;
    const eqIdx = nameValue.indexOf("=");
    if (eqIdx < 0) continue;

    const name = nameValue.slice(0, eqIdx);
    const value = nameValue.slice(eqIdx + 1);

    const opts: {
      expires?: Date;
      maxAge?: number;
      path?: string;
      httpOnly?: boolean;
      secure?: boolean;
      sameSite?: "lax" | "strict" | "none";
    } = {};

    for (const raw of attrs) {
      const [kRaw, ...rest] = raw.split("=");
      const k = kRaw.toLowerCase();
      const v = rest.join("=");

      if (k === "path") opts.path = v || "/";
      else if (k === "expires") opts.expires = v ? new Date(v) : undefined;
      else if (k === "max-age") opts.maxAge = v ? Number(v) : undefined;
      else if (k === "httponly") opts.httpOnly = true;
      else if (k === "secure") opts.secure = true;
      else if (k === "samesite") {
        const vv = (v || "").toLowerCase();
        if (vv === "lax" || vv === "strict" || vv === "none") opts.sameSite = vv as any;
      }
    }

    resp.cookies.set(name, value, opts);
  }
}

export async function middleware(req: NextRequest) {
  const { pathname, origin } = req.nextUrl;

  // Проверяем ТОЛЬКО приватные страницы
  if (!isPrivatePath(pathname)) return NextResponse.next();

  // Узнаём сессию через наш API-роут (пробрасываем cookies)
  const sessionUrl = new URL("/api/auth/session", origin);
  const resp = await fetch(sessionUrl.toString(), {
    headers: { cookie: req.headers.get("cookie") ?? "", accept: "application/json" },
    cache: "no-store",
  });

  // Авторизован, только если 200 и тело не пустое
  const body = resp.ok ? (await resp.clone().text()).trim() : "";
  const isAuthed = resp.ok && body !== "";

  if (!isAuthed) {
    const url = req.nextUrl.clone();
    url.pathname = "/sign-in";
    return NextResponse.redirect(url);
  }

  // Пропускаем дальше и прокидываем Set-Cookie (если бекенд обновил токены)
  const out = NextResponse.next();
  const setCookies =
    ((resp.headers as any).getSetCookie?.() as string[] | undefined) ??
    (resp.headers.get("set-cookie") ? [resp.headers.get("set-cookie") as string] : []);
  if (setCookies?.length) {
    applySetCookieStrings(out, setCookies);
    out.headers.set("Cache-Control", "no-store");
  }

  return out;
}

// Матчим только приватные пути
export const config = {
  matcher: ["/profile/:path*", "/notes/:path*"],
};
