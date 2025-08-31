// app/(private routes)/notes/filter/[...slug]/page.tsx
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import NotesClient from "./Notes.client";

const VALID_TAGS = [
  "All",
  "Todo",
  "Work",
  "Events",
  "Personal",
  "Meeting",
  "Shopping",
  "Sport",
  "Traveling",
] as const;

type PageProps = {
  params: { slug?: string[] };
  searchParams?: { q?: string; page?: string };
};

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function FilterPage({ params, searchParams }: PageProps) {
  const slugArr = params?.slug ?? [];
  const tagRaw = slugArr[0] ?? "All";
  if (!VALID_TAGS.includes(tagRaw as (typeof VALID_TAGS)[number])) notFound();

  // "All" => без фильтра
  const tag = tagRaw === "All" ? null : tagRaw;
  const q = typeof searchParams?.q === "string" ? searchParams.q : "";
  const page = Number(typeof searchParams?.page === "string" ? searchParams.page : "1");

  // соберём абсолютный base (нужно для серверного fetch)
  const h = await headers();
  const envBase = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
  const proto = h.get("x-forwarded-proto") ?? "https";
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "";
  const base = envBase || `${proto}://${host}`;

  const qc = new QueryClient();

  await qc.prefetchQuery({
    queryKey: ["notes", { q, page, tag: tag ?? "" }],
    queryFn: async () => {
      const url = new URL("/api/notes", base);
      if (q) url.searchParams.set("search", q); // ВАЖНО: параметр называется search
      if (page > 1) url.searchParams.set("page", String(page));
      if (tag) url.searchParams.set("tag", tag);

      const cookie = (await headers()).get("cookie") ?? "";
      const res = await fetch(url.toString(), {
        headers: { cookie, accept: "application/json" },
        cache: "no-store",
      });
      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(t || `Failed to fetch notes (${res.status})`);
      }
      const raw = await res.json().catch(() => null);

      // Нормализация под NotesResponse
      if (Array.isArray(raw)) return { notes: raw };
      return {
        notes: Array.isArray(raw?.notes) ? raw.notes : [],
        totalPages: raw?.totalPages,
      };
    },
  });

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <NotesClient tag={tag} />
    </HydrationBoundary>
  );
}
