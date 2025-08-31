// components/TanStackProvider/TanStackProvider.tsx
"use client";

import { PropsWithChildren, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { ReactQueryDevtools } from "@tanstack/react-query-devtools"; // по желанию

export default function TanStackProvider({ children }: PropsWithChildren) {
  // один стабильный экземпляр клиента
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            refetchOnWindowFocus: false,
            staleTime: 1000 * 10,
          },
          mutations: {
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={client}>
      {children}
      {/* {process.env.NODE_ENV !== "production" && <ReactQueryDevtools />} */}
    </QueryClientProvider>
  );
}
