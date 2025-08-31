// SSR компонент
import type { Metadata } from "next";
// import { fetchNotes } from "@/lib/api/clientApi";
import NotesClient from "./Notes.client";
import { fetchNotes } from "@/lib/api/serverApi";

type Props = {
  params: Promise<{ slug?: string[] }>;
};

// metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = (await params).slug || [];
  const tag =
    slug.length > 0 && slug[0].toLowerCase() !== "all" ? slug[0] : "All";

  const pageTitle = `Notes – ${tag}`;
  const pageDescription = `Filtered notes by tag: ${tag}`;

  return {
    title: pageTitle,
    description: pageDescription,
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url: `https://notehub.com/notes/filter/${tag.toLowerCase()}`,
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

export default async function NotesSlugPage({ params }: Props) {
  const slug = (await params).slug || []; // check (await params)
  let tag: string | undefined = undefined;

  if (slug.length > 0 && slug[0].toLowerCase() !== "all") {
    tag = slug[0];
  }

  try {
    const data = await fetchNotes("", 1, tag);

    return <NotesClient initialData={data} tag={tag} />;
  } catch (error) {
    return (
      <div>
        <p>Something went wrong while fetching the notes.</p>
      </div>
    );
  }
}
