import type { Metadata } from "next";
import { Roboto } from 'next/font/google';
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import { Toaster } from "react-hot-toast";
import TanStackProvider from "@/components/TanStackProvider/TanStackProvider";
import AuthProvider from '@/components/AuthProvider/AuthProvider';
import "./globals.css";

const robotoSans = Roboto({
  subsets: ['latin'], 
  weight: ['400', '700'],
  variable: '--font-roboto', 
  display: 'swap', 
});

export const metadata: Metadata = {
  title: "NoteHub App",
  description: "NoteHub is a modern web app to take, organize, and manage your notes with ease.",
  openGraph: {
      title: "NoteHub App",
      description: "NoteHub is a modern web app to take, organize, and manage your notes with ease.",
      url: "https://notehub.com",
      siteName: "NoteHub",
      images: [
        {
          url: "https://ac.goit.global/fullstack/react/notehub-og-meta.jpg",
          width: 1200,
          height: 630,
        },
      ],
    },
}

export default function RootLayout({
  children,
  modal
}: Readonly<{
  children: React.ReactNode,
  modal: React.ReactNode,
}>) {
  return (
    <html lang="en">
      <body className={`${robotoSans.variable}`}>
        <TanStackProvider>
          <AuthProvider>
            <Header />
            {children}
            {modal}
            <Toaster position="top-right" />
            <Footer />
          </AuthProvider>
        </TanStackProvider>
      </body>
    </html>
  );
}
