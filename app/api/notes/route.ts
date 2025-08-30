import { NextRequest } from "next/server";
import { relay, upstream } from "../_utils/utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const res = await upstream("/notes", {
    method: "GET",
    searchParams: {
      search: sp.get("search") ?? undefined,
      page: sp.get("page") ?? undefined,
      perPage: sp.get("perPage") ?? undefined,
      tag: sp.get("tag") ?? undefined,
    },
  });
  return relay(res);
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const res = await upstream("/notes", { method: "POST", body });
  return relay(res);
}
