export default function PrivateGroupLayout({
  children, modal,
}: { children: React.ReactNode; modal: React.ReactNode }) {
  // TODO: можно добавить серверную проверку сессии и redirect('/sign-in')
  return (
    <>
      {children}
      {modal}
    </>
  );
}
