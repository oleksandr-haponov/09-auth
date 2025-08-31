import SignInClient from "./SignInClient";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default function Page({ searchParams }: { searchParams?: { email?: string } }) {
  const initialEmail = typeof searchParams?.email === "string" ? searchParams.email : "";
  return <SignInClient initialEmail={initialEmail} />;
}
