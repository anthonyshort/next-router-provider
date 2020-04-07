import { useContext, useEffect } from 'react';
import { NextRouter } from 'next/router';
import { Route } from './types';
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
  isRouteActive: (route: Route) => boolean;
  getQuery<T>(key: string): T;
}

/**
 * Get a value from the router.query and set it's type.
 * @param router Next router
 * @param key Query value
 */
function getQuery<T>(router: NextRouter, key: string): T {
  return (router.query[key] as unknown) as T;
}

/**
 * A replacement for useRouter from Next.js. This returns a modified API that accepts Route objects and some helper
 * functions for generating links, click handlers, and hrefs.
 */
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
    isRouteActive: (route: Route) => router.route.startsWith(route.pathname),
  };
}

/**
 * Get a URL param or query value.
 * @param key Query param name
 */
export function useQuery<T>(key: string): T {
  const { router } = useRouter();
  return getQuery<T>(router, key);
}

/**
 * Prefetch the JS bundles for a route
 * @param route
 */
export function usePrefetch(route: Route) {
  const { router } = useRouter();
  useEffect(() => {
    router.prefetch(route.pathname);
  }, [route.pathname]);
}
