// app/(private routes)/layout.tsx

export const revalidate = 0; // без кеша
export const dynamic = "force-dynamic"; // всегда динамически

export default function PrivateRoutesLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  /** слот для параллельного роута @modal */
  modal: React.ReactNode;
}) {
  return (
    <>
      {children}
      {modal}
    </>
  );
}
