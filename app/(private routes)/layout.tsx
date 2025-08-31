// app/(private routes)/layout.tsx
import AuthProvider from "@/components/AuthProvider/AuthProvider";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default function PrivateRoutesLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  /** слот для параллельного роута @modal */
  modal: React.ReactNode;
}) {
  return (
    <AuthProvider>
      {children}
      {modal}
    </AuthProvider>
  );
}
