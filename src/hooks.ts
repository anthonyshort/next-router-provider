import { useContext, useEffect } from 'react';
import { NextRouter } from 'next/router';
import { Route, RouteOptions } from './types';
import { RouterContext } from './contexts/router';
import {
  pushRoute,
  replaceRoute,
  createLink,
  routeToString,
  createClickHandler,
  findParams,
} from './helpers';

export interface RouterHook {
  router: NextRouter;
  pushRoute: (
    route: Route,
    options?: RouteOptions
  ) => ReturnType<typeof pushRoute>;
  replaceRoute: (
    route: Route,
    options?: RouteOptions
  ) => ReturnType<typeof replaceRoute>;
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
    pushRoute: (route: Route, options?: RouteOptions) =>
      pushRoute(router, route, options),
    replaceRoute: (route: Route, options?: RouteOptions) =>
      replaceRoute(router, route, options),
    createLink: (route: Route, options?: RouteOptions) =>
      createLink(router, route, options),
    createHref: (route: Route) => routeToString(route),
    createClickHandler: (route: Route, options?: RouteOptions) =>
      createClickHandler(router, route, options),
    isRouteActive: (route: Route) => router.route.startsWith(route.pathname),
  };
}

/**
 * Get a URL param or query value.
 * @param key Query param name
 */
export function useQuery<T = string | undefined>(key: string): T {
  const { router } = useRouter();
  return getQuery<T>(router, key);
}

/**
 * Get a route parameter. This will throw if the route parameter doesn't exist.
 * @param key
 */
export function useRouteParam<T = string>(key: string): T {
  const { router } = useRouter();
  const params = findParams(router.route);
  if (!params.includes(key)) {
    throw new Error(
      `The current page route does not contain the parameter "${key}". Did you mispell it?`
    );
  }
  const value = getQuery<T | undefined>(router, key);
  if (!value) {
    throw new Error(`Route parameter "${key}" doesn’t exist`);
  }
  return value;
}

/**
 * Prefetch the JS bundles for a route
 * @param route
 */
export function usePrefetch(route?: Route) {
  const { router } = useRouter();
  useEffect(() => {
    if (route) {
      router.prefetch(route.pathname);
    }
  }, [route && route.pathname]);
}
