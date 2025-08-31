import CreateNote from "@/components/CreateNote/CreateNote";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create new note | NoteHub",
  description: "Create a new note in your personal NoteHub storage",
  openGraph: {
      title: "Create new note | NoteHub",
      description: "Create a new note in your personal NoteHub storage",
      url: "https://notehub.com//notes/action/create",
      siteName: "NoteHub",
      images: [
        {
          url: "https://ac.goit.global/fullstack/react/notehub-og-meta.jpg",
          width: 1200,
          height: 630,
          alt: "NoteHub Create Page",
        },
      ],
    },
}

export default function CreatePage() {

  return <CreateNote />;
}