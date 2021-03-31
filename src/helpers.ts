import url from 'url';
import { NextRouter } from 'next/router';
import {
  Query,
  Route,
  CreateMockRouterOptions,
  RouteOptions,
  ClickHandler,
  Link,
} from './types';
import { EventEmitter } from 'events';

const noop = (): void => undefined;

function omit(obj: Record<string, string>, properties: string[]) {
  const keys = Object.keys(obj);
  const res: Record<string, string> = {};
  for (var i = 0; i < keys.length; i++) {
    const key = keys[i];
    const val = obj[key];
    if (properties.indexOf(key) === -1) {
      res[key] = val;
    }
  }
  return res;
}

/**
 * Get all of the matches within a string
 * @param regex Any regex object
 * @param str A string to find the matches in
 * @param matches Internal argument to build the matches
 */
function findMatches(
  regex: RegExp,
  str: string,
  matches: string[] = []
): string[] {
  const res = regex.exec(str);
  const match = res && (res[1] as string);
  if (match) {
    matches.push(match);
    findMatches(regex, str, matches);
  }
  return matches;
}

/**
 * Find all matching params within a string
 * @param pathname The url with [:id] type params
 */
export function findParams(pathname: string): string[] {
  return findMatches(/\[([a-zA-Z0-9]+)\]/g, pathname);
}

/**
 * Returns a new query object without the values of the params
 * @param pathname The url with params
 * @param query Object of params
 */
export function removeParams(pathname: string, query: Query): Query {
  return omit(query, findParams(pathname));
}

/**
 * Replace all params within a url with values from an object
 * @param str
 * @param params
 */
export function replaceParams(str: string, params?: Query): string {
  if (!params) return str;
  let pathname = str;
  Object.keys(params).forEach(key => {
    const value = params[key];
    pathname = pathname.replace(`[${key}]`, value);
  });
  return pathname;
}

/**
 * Calls router.push with a route object. This will automatically generate the href and as params.
 *
 *    const router = useRouter();
 *    pushRoute(router, {
 *      pathname: '/admin/producer-dasboard/[uuid]',
 *      query: {
 *        uuid: '1',
 *        tab: 'requests'
 *      }
 *    })
 *
 * @param router The Next router from useRouter
 * @param route The route information
 */
export async function pushRoute(
  router: NextRouter,
  route: Route,
  options?: RouteOptions
): Promise<boolean> {
  return navigate(router, route, 'push', options);
}

/**
 * Calls router.replace with a route object. This will automatically generate the href and as params.
 *
 *    const router = useRouter();
 *    pushRoute(router, {
 *      pathname: '/admin/producer-dasboard/[uuid]',
 *      query: {
 *        uuid: '1',
 *        tab: 'requests'
 *      }
 *    })
 *
 * @param router The Next router from useRouter
 * @param route The route information
 */
export async function replaceRoute(
  router: NextRouter,
  route: Route,
  options?: RouteOptions
): Promise<boolean> {
  return navigate(router, route, 'replace', options);
}

/**
 * Calls router.push or router.replace
 */
async function navigate(
  router: NextRouter,
  route: Route,
  type: 'push' | 'replace',
  options?: RouteOptions
): Promise<boolean> {
  const { pathname, query } = route;
  const queryWithoutParams = omit(query || {}, findParams(pathname));
  const shouldScroll = pathname.indexOf('#') > -1;
  const success = await router[type](
    {
      pathname,
      query,
    },
    {
      pathname: replaceParams(pathname, query),
      query: queryWithoutParams,
    },
    options
  );
  if (success && shouldScroll) {
    window.scrollTo(0, 0);
    document.body.focus();
  }
  return success;
}

/**
 * Take a route with a pathname and optional query and turn it into a real path.
 * This will also replace any params, like [:id], within the string
 * @param route The route to transform into a string
 */
export function routeToString(
  router: Pick<NextRouter, 'basePath'>,
  route: Route
): string {
  const { pathname, query = {} } = route;
  const { basePath = '' } = router;

  return url.format({
    pathname: `${basePath}${replaceParams(pathname, query)}`,
    query: removeParams(pathname, query),
  });
}

/**
 * When a user clicks a link determine if they're trying to open in a new tab.
 * @param e
 */
export function wantsNewTab(e: any): boolean {
  const { nodeName } = e.currentTarget;
  const target = e.currentTarget.getAttribute('target');

  // HTML target attribute
  if (target && target !== '_self') {
    return true;
  }

  // ignore click for new tab / new window behavior
  // https://github.com/zeit/next.js/blob/canary/packages/next/client/link.tsx#L140
  if (
    nodeName === 'A' &&
    (e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      (e.nativeEvent && e.nativeEvent.which === 2))
  ) {
    return true;
  }

  return false;
}

export function createClickHandler(
  router: NextRouter,
  route: Route,
  options?: RouteOptions
): ClickHandler {
  return (e: React.MouseEvent<Element, MouseEvent>) => {
    if (wantsNewTab(e)) return;
    e.preventDefault();
    pushRoute(router, route, options);
  };
}

/**
 * Create a link to a route that can be used with HTML anchor tags
 * @param router The next router instance
 * @param route
 */
export function createLink(
  router: NextRouter,
  route: Route,
  options?: RouteOptions
): Link {
  return {
    route,
    isActive: router.route === route.pathname,
    push: () => pushRoute(router, route, options),
    replace: () => replaceRoute(router, route, options),
    onClick: createClickHandler(router, route),
    href: routeToString(router, route),
  };
}

/**
 * This function creates a mock NextRouter object that can be used in tests and stories. Just call createMockRouter
 * with a pathname and an optional query object. This will return a plain object with the same
 * shape as NextRouter.
 *
 * You can spy on this router in tests by using `jest.spyOn(router, 'push')`. This will let you assert that the router
 * was correctly called using `expect(router.push).toHaveBeenCalledWith(...)`.
 *
 *    const router = createMockRouter({
 *      pathname: '/admin/producer-dashboard/requests/[uuid]',
 *      query: {
 *        uuid: 'sdfsdf'
 *      }
 *    })
 *
 * You can use this as a replacement for the router in <RouterProvider> to set the router on React's context.
 * @param options
 */
export function createMockRouter(options: CreateMockRouterOptions): NextRouter {
  const { pathname, query = {}, basePath = '' } = options;

  return {
    pathname,
    isFallback: false,
    basePath,
    query,
    asPath: routeToString(
      { basePath: '' },
      {
        pathname,
        query,
      }
    ),
    route: pathname,
    back: noop,
    beforePopState: noop,
    push: () => Promise.resolve(true),
    replace: () => Promise.resolve(true),
    reload: noop,
    prefetch: () => Promise.resolve(),
    events: new EventEmitter(),
  };
}
