import { NextRequest, NextResponse } from "next/server";

const PUBLIC_ROUTES = ["/sign-in", "/sign-up"];
const PRIVATE_PREFIXES = ["/profile", "/notes"];

async function isAuthenticated(req: NextRequest): Promise<boolean> {
  try {
    const url = new URL("/api/auth/session", req.nextUrl.origin);
    const res = await fetch(url.toString(), {
      headers: { cookie: req.headers.get("cookie") ?? "" },
      cache: "no-store",
    });
    if (!res.ok) return false;
    const text = await res.text();
    if (!text) return false;
    try {
      const user = JSON.parse(text);
      return Boolean(user?.email || user?.id || user?.username);
    } catch {
      return false;
    }
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isPrivate = PRIVATE_PREFIXES.some((p) => pathname.startsWith(p));
  const isPublicAuth = PUBLIC_ROUTES.includes(pathname);

  if (!isPrivate && !isPublicAuth) return NextResponse.next();

  const authed = await isAuthenticated(req);

  if (isPrivate && !authed) {
    const url = new URL("/sign-in", req.nextUrl);
    return NextResponse.redirect(url);
  }

  if (isPublicAuth && authed) {
    const url = new URL("/profile", req.nextUrl);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/profile/:path*", "/notes/:path*", "/sign-in", "/sign-up"],
};
