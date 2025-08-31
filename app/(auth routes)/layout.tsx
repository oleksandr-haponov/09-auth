// app/(auth routes)/layout.tsx
import { Suspense } from "react";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default function AuthGroupLayout({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<div style={{ padding: 16 }}>Loading…</div>}>{children}</Suspense>;
}
