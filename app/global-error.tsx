// app/global-error.tsx
"use client";

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  return (
    <html>
      <body style={{ padding: 20 }}>
        <h2>Something went wrong</h2>
        <pre style={{ whiteSpace: "pre-wrap" }}>{error.message}</pre>
        <a href="/" style={{ display: "inline-block", marginTop: 12 }}>
          Go Home
        </a>
      </body>
    </html>
  );
}
