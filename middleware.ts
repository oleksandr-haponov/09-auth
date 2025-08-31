// middleware.ts
import { NextRequest, NextResponse } from "next/server";

const PRIVATE_PREFIXES = ["/profile", "/notes"] as const;
const AUTH_ROUTES = ["/sign-in", "/sign-up"] as const;

function isPrivatePath(pathname: string): boolean {
  return PRIVATE_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));
}
function isAuthPath(pathname: string): boolean {
  return AUTH_ROUTES.includes(pathname as (typeof AUTH_ROUTES)[number]);
}

/** Тихо дергаем наш API /api/auth/session c пробросом cookies */
async function fetchSession(req: NextRequest): Promise<Response | null> {
  try {
    const url = new URL("/api/auth/session", req.nextUrl.origin);
    const resp = await fetch(url.toString(), {
      headers: { cookie: req.headers.get("cookie") ?? "", accept: "application/json" },
      cache: "no-store",
    });
    return resp;
  } catch {
    return null;
  }
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
      // ВАЖНО: domain игнорируем — оставляем first-party куки
    }

    resp.cookies.set(name, value, opts);
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const needsCheck = isPrivatePath(pathname) || isAuthPath(pathname);
  if (!needsCheck) return NextResponse.next();

  const sessionResp = await fetchSession(req);
  const bodyText = sessionResp ? await sessionResp.clone().text() : "";
  const isAuthed = !!sessionResp && sessionResp.ok && bodyText.trim() !== "";

  let res: NextResponse;
  if (isPrivatePath(pathname) && !isAuthed) {
    // Гость лезет в приват — отправим на логин
    res = NextResponse.redirect(new URL("/sign-in", req.url));
  } else if (isAuthPath(pathname) && isAuthed) {
    // Авторизованный открывает /sign-in|/sign-up — ведём на профиль
    res = NextResponse.redirect(new URL("/profile", req.url));
  } else {
    res = NextResponse.next();
  }

  // Если /api/auth/session прислал Set-Cookie (например, обновил токены) — переложим их в ответ
  if (sessionResp) {
    const setCookies =
      ((sessionResp.headers as any).getSetCookie?.() as string[] | undefined) ??
      (sessionResp.headers.get("set-cookie")
        ? [sessionResp.headers.get("set-cookie") as string]
        : []);
    if (setCookies?.length) {
      applySetCookieStrings(res, setCookies);
      res.headers.set("Cache-Control", "no-store");
    }
  }

  return res;
}

export const config = {
  matcher: ["/profile/:path*", "/notes/:path*", "/sign-in", "/sign-up"],
};
