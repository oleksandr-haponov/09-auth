import { NextRequest } from "next/server";
import { relay, upstream } from "../../_utils/utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: NextRequest) {
  const body = await req.text(); // пробрасываем как есть
  const res = await upstream("/auth/login", { method: "POST", body });
  return relay(res);
}
