import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
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

export async function POST(req: NextRequest) {
  const json = await req.json().catch(() => ({}));

  const res = await upstream("/auth/login", {
    // CHANGED: /auth/register -> /auth/login
    method: "POST",
    body: JSON.stringify(json),
    headers: {
      "content-type": "application/json",
      accept: "application/json",
    },
  });

  // Переносимо cookies з бекенду у браузер
  const setCookieHeaderArray: string[] =
    ((res.headers as any).getSetCookie?.() as string[] | undefined) ??
    (res.headers.get("set-cookie") ? [res.headers.get("set-cookie") as string] : []);

  if (setCookieHeaderArray.length) {
    const store = cookies();

    for (const cookieStr of setCookieHeaderArray) {
      const parts = cookieStr.split(";").map((p) => p.trim());
      const [nameValue, ...attrs] = parts;
      const eqIdx = nameValue.indexOf("=");
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
          if (vv === "lax" || vv === "strict" || vv === "none") {
            opts.sameSite = vv;
          }
        }
      }

      store.set(name, value, opts);
    }
  }

  if (res.status === 204) {
    return new NextResponse(null, { status: 204 });
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const body = await res.json().catch(() => ({}));
    return NextResponse.json(body, { status: res.status });
  } else {
    const text = await res.text();
    return new NextResponse(text, {
      status: res.status,
      headers: { "content-type": contentType || "text/plain; charset=utf-8" },
    });
  }
}
