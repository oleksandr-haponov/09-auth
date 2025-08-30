import { NextRequest } from "next/server";
import { relay, upstream } from "../../_utils/utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const res = await upstream(`/notes/${params.id}`, { method: "GET" });
  return relay(res);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const res = await upstream(`/notes/${params.id}`, { method: "DELETE" });
  return relay(res);
}
