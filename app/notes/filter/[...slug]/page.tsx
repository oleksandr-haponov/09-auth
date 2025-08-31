// app/notes/filter/[...slug]/page.tsx
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { notFound } from "next/navigation";
import { fetchNotes } from "@/lib/api"; // як у твоєму проєкті
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

export default async function FilterPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string[] }>;
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;

  const tagRaw = slug[0] ?? "All";
  if (!VALID_TAGS.includes(tagRaw as (typeof VALID_TAGS)[number])) {
    notFound();
  }

  const tag = tagRaw === "All" ? undefined : tagRaw;
  const q = typeof sp?.q === "string" ? sp.q : "";
  const page = sp?.page ? Number(sp.page) : 1;

  const qc = new QueryClient();
  await qc.prefetchQuery({
    queryKey: ["notes", { q, page, tag: tag ?? "" }],
    queryFn: () => fetchNotes({ q, page, tag }),
  });

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <NotesClient tag={tag ?? null} />
    </HydrationBoundary>
  );
}
