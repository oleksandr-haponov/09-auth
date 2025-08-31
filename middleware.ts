// middleware.ts
import { NextRequest, NextResponse } from "next/server";

const PUBLIC_ROUTES = ["/sign-in", "/sign-up"];
const PRIVATE_PREFIXES = ["/profile", "/notes"];

// Универсальная проверка наличия кук по названию (без завязки на точное имя)
function hasCookie(header: string, names: string[]) {
  const re = new RegExp(`(^|;\\s*)(${names.join("|")})=`, "i");
  return re.test(header);
}

/** Тихо дергаем наш API /api/auth/session и возвращаем массив Set-Cookie */
async function refreshViaApi(req: NextRequest): Promise<string[]> {
  try {
    const url = new URL("/api/auth/session", req.nextUrl.origin);
    const resp = await fetch(url.toString(), {
      headers: { cookie: req.headers.get("cookie") ?? "" },
      cache: "no-store",
    });
    const fromApi =
      ((resp.headers as any).getSetCookie?.() as string[] | undefined) ??
      (resp.headers.get("set-cookie") ? [resp.headers.get("set-cookie") as string] : []);
    return fromApi ?? [];
  } catch {
    return [];
  }
}

/** Переносим Set-Cookie в реальный ответ (Domain не копируем!) */
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
      // ВАЖНО: domain игнорируем (оставляем first-party)
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

  // Неинтересные маршруты пропускаем
  if (!isPrivate && !isPublicAuth) return NextResponse.next();

  const cookieHeader = req.headers.get("cookie") || "";
  const hasAccess = hasCookie(cookieHeader, ["accessToken", "access", "token"]);
  const hasRefresh = hasCookie(cookieHeader, ["refreshToken", "refresh"]);

  // Уже есть access → считаем авторизованным
  if (hasAccess) {
    if (isPublicAuth) {
      return NextResponse.redirect(new URL("/profile", req.url));
    }
    return NextResponse.next();
  }

  // Нет access, но есть refresh → тихо продлеваем
  if (hasRefresh) {
    const setCookies = await refreshViaApi(req);
    if (setCookies.length > 0) {
      if (isPublicAuth) {
        const res = NextResponse.redirect(new URL("/profile", req.url));
        applySetCookieStrings(res, setCookies);
        res.headers.set("Cache-Control", "no-store");
        return res;
      }
      if (isPrivate) {
        const res = NextResponse.next();
        applySetCookieStrings(res, setCookies);
        res.headers.set("Cache-Control", "no-store");
        return res;
      }
    }
    // refresh был, но продление не удалось → пойдём дальше как неавторизованные
  }

  // Неавторизованный:
  if (isPrivate) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/profile/:path*", "/notes/:path*", "/sign-in", "/sign-up"],
};
