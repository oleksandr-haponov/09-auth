import { NextRequest } from "next/server";
import { relay, upstream } from "../../_utils/utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(_req: NextRequest) {
  const res = await upstream("/auth/refresh", { method: "POST" });
  return relay(res);
}
