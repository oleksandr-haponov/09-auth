import { NextRequest } from "next/server";
import { relay, upstream } from "../../_utils/utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// У Next 15 для route handlers динамічні params — це Promise
type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const res = await upstream(`/notes/${id}`, { method: "GET" });
  return relay(res);
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const res = await upstream(`/notes/${id}`, { method: "DELETE" });
  return relay(res);
}
