// app/layout.tsx
import type { Metadata, Viewport } from "next";
import "./globals.css";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import TanStackProvider from "@/components/TanStackProvider/TanStackProvider";

export const metadata: Metadata = {
  title: {
    default: "NoteHub",
    template: "%s | NoteHub",
  },
  description: "Notes manager with auth (Next.js App Router)",
  icons: { icon: "/favicon.ico" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* a11y: быстрый переход к основному контенту */}
        <a href="#main" className="visually-hidden-focusable">
          Skip to content
        </a>

        <TanStackProvider>
          <Header />
          <main id="main">{children}</main>
          <Footer />
        </TanStackProvider>
      </body>
    </html>
  );
}
