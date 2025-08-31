import { Note } from "../../types/note";
import Link from "next/link";

type Props = {
  note: Note;
};

export default function NoteItem({ note }: Props) {
  return (
    <li>
      <Link href={`/notes/${note.id}`}>{note.title}</Link>
    </li>
  );
}
