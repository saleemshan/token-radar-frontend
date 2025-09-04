'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import React from 'react';
const queryClient = new QueryClient();
const ReactQueryClientProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NEXT_PUBLIC_NODE_ENV === 'development' && (
        <ReactQueryDevtools />
      )}
    </QueryClientProvider>
  );
};

export default ReactQueryClientProvider;
