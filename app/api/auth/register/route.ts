import { NextRequest } from "next/server";
import { relay, upstream } from "../../_utils/utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: NextRequest) {
  const json = await req.json().catch(() => ({}));
  const res = await upstream("/auth/register", {
    method: "POST",
    body: JSON.stringify(json),
    headers: {
      "content-type": "application/json",
      accept: "application/json",
    },
  });
  return relay(res);
}
