'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, ReactNode } from 'react';

// Create a client
const queryClient = new QueryClient();

export default function ReactQueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(queryClient);

  return (
    <QueryClientProvider client={client}>
      {children}
    </QueryClientProvider>
  );
}
