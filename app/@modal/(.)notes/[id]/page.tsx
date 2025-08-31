import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import NotePreviewClient from "../[id]/NotePreview.client";
import { fetchNoteById } from "@/lib/api/serverApi";

interface NoteDetailsProps {
  params: Promise<{ id: string }>;
}
export default async function NotePreview({ params }: NoteDetailsProps) {
  const { id } = await params;

  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ["note", id],
    queryFn: () => fetchNoteById(id),
  });
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <NotePreviewClient id={id} />
    </HydrationBoundary>
  );
}
