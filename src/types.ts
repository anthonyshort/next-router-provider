export type Query = Record<string, string>;

/**
 * This represents a "route" within next. The pathname can contain params, like [:uuid]
 * and the query is optional. The values for the params exist as part of the query.
 *
 *      const route: Route = {
 *        pathname: '/admin/producer-dasboard/[uuid]',
 *        query: {
 *          uuid: '1',
 *          tab: 'requests'
 *        }
 *      }
 *
 * This format is used by most of the router helpers.
 */
export interface Route {
  pathname: string;
  query?: Query;
}

export interface CreateMockRouterOptions {
  pathname: string;
  asPath?: string;
  query?: Record<string, string>;
}

export interface RouteOptions {
  shallow?: boolean;
}