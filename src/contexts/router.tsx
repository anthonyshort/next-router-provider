import React from 'react';
import { NextRouter, useRouter } from 'next/router';
import { createContext } from 'react';

export const RouterContext = createContext<NextRouter | null>(null);

export function RouterProvider(props: {
  children: React.ReactNode;
}): JSX.Element {
  const { children } = props;
  const router = useRouter();
  return (
    <RouterContext.Provider value={router}>{children}</RouterContext.Provider>
  );
}
