
// Варіант 1 з перенаправленням - Вас буде перенаправлено на головну через кілька секунд…
import type { Metadata } from "next";


export const metadata: Metadata = {
  title: "404 - Page Not Found | NoteHub",
  description: "The page you're looking for does not exist on NoteHub.",
    openGraph: {
    title: "404 - Page Not Found | NoteHub",
    description: "The page you're looking for does not exist on NoteHub.",
    url: "https://notehub.com/not-found",
    images: [
  {
    url: "https://ac.goit.global/fullstack/react/notehub-og-meta.jpg",
    width: 1200,
    height: 630,
    alt: "NoteHub 404 Page",
  },
],
  },
};

 const NotFound = () => {

  return (
    <div>
      <h1>404 - Сторінку не знайдено</h1>
    </div>
  );
};

export default NotFound;
