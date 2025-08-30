import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { relay, upstream, JAR_COOKIE } from "../../_utils/utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(_req: NextRequest) {
  const res = await upstream("/auth/logout", { method: "POST" });
  // локально чистим наш jar
  cookies().delete(JAR_COOKIE);
  return relay(res);
}
