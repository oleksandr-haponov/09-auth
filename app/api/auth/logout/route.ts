import { NextRequest, NextResponse } from "next/server";
import { upstream, JAR_COOKIE } from "../../_utils/utils";

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

export async function POST(_req: NextRequest) {
  const res = await upstream("/auth/logout", { method: "POST" });

  // Сконструируем ответ, в который будем проставлять cookies
  if (res.status === 204) {
    const response = new NextResponse(null, { status: 204 });

    // на всякий случай подчистим локальные куки
    response.cookies.delete(JAR_COOKIE);
    response.cookies.delete("accessToken");
    response.cookies.delete("refreshToken");

    return response;
  }

  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const body = isJson ? await res.json().catch(() => ({})) : await res.text();

  const response = isJson
    ? NextResponse.json(body, { status: res.status })
    : new NextResponse(body, {
        status: res.status,
        headers: { "content-type": contentType || "text/plain; charset=utf-8" },
      });

  // Проброс Set-Cookie из апстрима
  const setCookieHeaderArray: string[] =
    ((res.headers as any).getSetCookie?.() as string[] | undefined) ??
    (res.headers.get("set-cookie") ? [res.headers.get("set-cookie") as string] : []);

  if (setCookieHeaderArray.length) {
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
          if (vv === "lax" || vv === "strict" || vv === "none") opts.sameSite = vv;
        }
      }

      response.cookies.set(name, value, opts);
    }
  }

  // Всегда чистим наш «джар» и возможные токены
  response.cookies.delete(JAR_COOKIE);
  response.cookies.delete("accessToken");
  response.cookies.delete("refreshToken");

  return response;
}
