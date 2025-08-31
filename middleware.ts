// middleware.ts
import { NextRequest, NextResponse } from "next/server";

const PUBLIC_ROUTES = ["/sign-in", "/sign-up"];
const PRIVATE_PREFIXES = ["/profile", "/notes"];

/** Зовём наш API для тихого продления и возвращаем массив Set-Cookie, если они были */
async function refreshViaApi(req: NextRequest): Promise<string[]> {
  try {
    const url = new URL("/api/auth/session", req.nextUrl.origin);
    const resp = await fetch(url.toString(), {
      headers: { cookie: req.headers.get("cookie") ?? "" },
      cache: "no-store",
    });
    // В ряде сред у Headers есть getSetCookie; иначе — одиночный 'set-cookie'
    const fromApi =
      ((resp.headers as any).getSetCookie?.() as string[] | undefined) ??
      (resp.headers.get("set-cookie") ? [resp.headers.get("set-cookie") as string] : []);
    // Успешное продление — когда действительно пришли новые cookie
    return fromApi ?? [];
  } catch {
    return [];
  }
}

/** Простенький парсер одного Set-Cookie в name, value, opts */
function applySetCookieStrings(resp: NextResponse, setCookies: string[]) {
  for (const cookieStr of setCookies) {
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
      domain?: string;
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
      else if (k === "domain") opts.domain = v || undefined;
      else if (k === "httponly") opts.httpOnly = true;
      else if (k === "secure") opts.secure = true;
      else if (k === "samesite") {
        const vv = v?.toLowerCase();
        if (vv === "lax" || vv === "strict" || vv === "none") opts.sameSite = vv;
      }
    }

    resp.cookies.set(name, value, opts);
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isPrivate = PRIVATE_PREFIXES.some((p) => pathname.startsWith(p));
  const isPublicAuth = PUBLIC_ROUTES.includes(pathname);

  // Быстрые флаги по кукам запроса
  const access = req.cookies.get("accessToken")?.value;
  const refresh = req.cookies.get("refreshToken")?.value;

  // Не интересующие нас маршруты просто пропускаем
  if (!isPrivate && !isPublicAuth) {
    return NextResponse.next();
  }

  // --- Частный случай: у нас есть access — считаем авторизованным
  if (access) {
    if (isPublicAuth) {
      // автор — на публичную (sign-in/up) не пускаем
      return NextResponse.redirect(new URL("/profile", req.url));
    }
    return NextResponse.next();
  }

  // --- Нет access: пробуем silent auth по refresh (если он есть)
  if (refresh) {
    const setCookies = await refreshViaApi(req);
    if (setCookies.length > 0) {
      // Продлили — приклеим Set-Cookie к реальному ответу
      if (isPublicAuth) {
        const res = NextResponse.redirect(new URL("/profile", req.url));
        applySetCookieStrings(res, setCookies);
        return res;
      }
      if (isPrivate) {
        const res = NextResponse.next();
        applySetCookieStrings(res, setCookies);
        return res;
      }
    }
    // refresh был, но продление не удалось — считаем неавторизованным, падаем ниже
  }

  // --- Неавторизованный:
  if (isPrivate) {
    // приватный → на логин
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }
  // публичный → пропускаем
  return NextResponse.next();
}

export const config = {
  matcher: ["/profile/:path*", "/notes/:path*", "/sign-in", "/sign-up"],
};
