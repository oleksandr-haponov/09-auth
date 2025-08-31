import { fetchNoteById } from "@/lib/api/serverApi";
import NoteDetailsClient from "./NoteDetails.client";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ id: string }>;
};

// metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const note = await fetchNoteById((await params).id);

  if (!note) {
    return {
      title: "Note not found",
      description: "This note does not exist.",
    };
  }

  const pageTitle = note.title;
  const pageDescription = `${note.content.slice(0, 100)}...`;

  return {
    title: pageTitle,
    description: pageDescription,
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url: `https://notehub.com/notes/${(await params).id}`,
      images: [
        {
          url: `https://ac.goit.global/fullstack/react/notehub-og-meta.jpg`,
          width: 1200,
          height: 630,
          alt: "Notes preview",
        },
      ],
    },
  };
}

export default async function NoteDetails({ params }: Props) {
  const { id } = await params;

  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ["note", id],
    queryFn: () => fetchNoteById(id),
  });

  return (
    <div>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <NoteDetailsClient />
      </HydrationBoundary>
    </div>
  );
}
