import { useContext, useEffect } from 'react';
import { NextRouter } from 'next/router';
import { Route } from 'types';
import { RouterContext } from './contexts/router';
import {
  pushRoute,
  replaceRoute,
  createLink,
  routeToString,
  createClickHandler,
} from './helpers';

export interface RouterHook {
  router: NextRouter;
  pushRoute: (route: Route) => ReturnType<typeof pushRoute>;
  replaceRoute: (route: Route) => ReturnType<typeof replaceRoute>;
  createLink: (route: Route) => ReturnType<typeof createLink>;
  createHref: (route: Route) => string;
  createClickHandler: (route: Route) => ReturnType<typeof createClickHandler>;
  isRouteActive: (pathname: string) => boolean;
  getQuery<T>(key: string): T;
}

function getQuery<T>(router: NextRouter, key: string): T {
  return (router.query[key] as unknown) as T;
}

export function useRouter(): RouterHook {
  const router = useContext(RouterContext);
  if (!router) {
    throw new Error('Missing <RouterContext>');
  }
  return {
    router,
    getQuery<T>(key: string): T {
      return getQuery<T>(router, key);
    },
    pushRoute: (route: Route) => pushRoute(router, route),
    replaceRoute: (route: Route) => replaceRoute(router, route),
    createLink: (route: Route) => createLink(router, route),
    createHref: (route: Route) => routeToString(route),
    createClickHandler: (route: Route) => createClickHandler(router, route),
    isRouteActive: (pathname: string) => router.route.startsWith(pathname),
  };
}

export function useQuery<T>(key: string): T {
  const { router } = useRouter();
  return getQuery<T>(router, key);
}

export function usePrefetch(pathname: string) {
  const { router } = useRouter();
  useEffect(() => {
    router.prefetch(pathname);
  }, [pathname]);
}
