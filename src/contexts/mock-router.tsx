import React from 'react';

import { RouterContext } from './router';
import { createMockRouter } from '../helpers';
import { Query } from '../types';

interface Props {
  pathname?: string;
  query?: Query;
  children: React.ReactNode;
}

export function MockRouterContext(props: Props): JSX.Element {
  const { pathname = '/', query, children } = props;
  const router = createMockRouter({
    pathname,
    query,
  });
  return <RouterContext.Provider value={router}>{children}</RouterContext.Provider>;
}
