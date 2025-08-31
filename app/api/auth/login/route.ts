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

export async function POST(req: NextRequest) {
  const json = await req.json().catch(() => ({}));

  const res = await upstream("/auth/login", {
    method: "POST",
    body: JSON.stringify(json),
    headers: {
      "content-type": "application/json",
      accept: "application/json",
    },
  });

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

  for (const cookieStr of setCookieHeaderArray) {
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
      // else if (k === "domain") IGNORE
      else if (k === "httponly") opts.httpOnly = true;
      else if (k === "secure") opts.secure = true;
      else if (k === "samesite") {
        const vv = v?.toLowerCase();
        if (vv === "lax" || vv === "strict" || vv === "none") opts.sameSite = vv;
      }
    }

    response.cookies.set(name, value, opts);
  }

  response.headers.set("Cache-Control", "no-store");
  return response;
}
