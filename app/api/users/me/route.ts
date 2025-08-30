import { NextRequest } from "next/server";
import { relay, upstream } from "../../_utils/utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(_req: NextRequest) {
  const res = await upstream("/users/me", { method: "GET" });
  return relay(res);
}

export async function PATCH(req: NextRequest) {
  const body = await req.text();
  const res = await upstream("/users/me", { method: "PATCH", body });
  return relay(res);
}
