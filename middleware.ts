import { NextRequest, NextResponse } from "next/server";

const PRIVATE_PREFIXES = ["/profile", "/notes"] as const;
const isPrivatePath = (p: string) => PRIVATE_PREFIXES.some((x) => p === x || p.startsWith(x + "/"));

export async function middleware(req: NextRequest) {
  const { pathname, origin } = req.nextUrl;
  if (!isPrivatePath(pathname)) return NextResponse.next();

  const sessionUrl = new URL("/api/auth/session", origin);
  const resp = await fetch(sessionUrl.toString(), {
    headers: { cookie: req.headers.get("cookie") ?? "", accept: "application/json" },
    cache: "no-store",
  });
  const body = resp.ok ? (await resp.clone().text()).trim() : "";
  const isAuthed = resp.ok && body !== "";

  if (!isAuthed) {
    const url = req.nextUrl.clone();
    url.pathname = "/sign-in";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/profile/:path*", "/notes/:path*"] };
