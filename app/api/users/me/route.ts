// app/api/users/me/route.ts
import { NextRequest, NextResponse } from "next/server";
import { upstream } from "../../_utils/utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type CookieOptions = {
  expires?: Date;
  maxAge?: number;
  path?: string;
  domain?: string;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: "lax" | "strict" | "none";
};

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
      else if (k === "domain") opts.domain = v || undefined;
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

async function proxy(method: "GET" | "PATCH", req: NextRequest) {
  const init: RequestInit = { method };

  if (method === "PATCH") {
    const json = await req.json().catch(() => ({}));
    init.body = JSON.stringify(json);
    // FIX: задати заголовки як Record<string, string>, а не індексувати HeadersInit
    init.headers = {
      "content-type": "application/json",
      accept: "application/json",
    } as Record<string, string>;
  }

  const res = await upstream("/users/me", init);

  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const status = res.status;

  const response =
    status === 204
      ? new NextResponse(null, { status })
      : isJson
        ? NextResponse.json(await res.json().catch(() => ({})), { status })
        : new NextResponse(await res.text(), {
            status,
            headers: { "content-type": contentType || "text/plain; charset=utf-8" },
          });

  const setCookieHeaderArray: string[] =
    ((res.headers as any).getSetCookie?.() as string[] | undefined) ??
    (res.headers.get("set-cookie") ? [res.headers.get("set-cookie") as string] : []);
  if (setCookieHeaderArray.length) applySetCookie(response, setCookieHeaderArray);

  response.headers.set("Cache-Control", "no-store");
  return response;
}

export async function GET(req: NextRequest) {
  return proxy("GET", req);
}

export async function PATCH(req: NextRequest) {
  return proxy("PATCH", req);
}
