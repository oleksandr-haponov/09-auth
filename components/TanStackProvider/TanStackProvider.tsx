'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

type Props = {
  children: React.ReactNode
}

const TanStackProvider = ({ children }: Props) => {
  const [qClient] = useState(() => new QueryClient())

  return <QueryClientProvider client={qClient}>{children}</QueryClientProvider>
}

export default TanStackProvider;