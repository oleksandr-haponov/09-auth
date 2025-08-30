import { NextRequest } from "next/server";
import { relay, upstream } from "../../_utils/utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const res = await upstream("/auth/register", { method: "POST", body });
  return relay(res);
}
