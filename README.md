# next-router-provider

Wrapper around the Next.js router that allows for mocking and makes it easier to use routes with parameters.

- Easily mock the Next router in tests and in Storybook
- Unit test components that uses the Next.js router
- Navigate to parametized routes

```tsx
import { useRouter } from 'next-router-provider';

function MyComponent() {
  const { pushRoute } = useRouter();

  function onClick() {
    pushRoute({
      pathname: '/posts/[id]',
      query: {
        id: '10',
      },
    });
  }

  return <button onClick={onClick}>Navigate</button>;
}
```

## Table of contents

- [Table of contents](#table-of-contents)
- [Install](#install)
- [Why?](#why)
- [Setup](#setup)
- [Usage](#usage)
- [API](#api)
  - [`Route`](#route)
  - [RouteLink](#routelink)
  - [`useRouter(): RouterHook`](#userouter-routerhook)
    - [`RouterHook`](#routerhook)
  - [`useQuery<T>(key: string): T`](#usequerytkey-string-t)
  - [`usePrefetch(pathname: string): void`](#useprefetchpathname-string-void)

## Install

```
yarn add next-router-provider
```

## Why?

The Next.js router isn't easy to mock in tests. There's no API for creating a mock router and there is no context provider you can use in tests to make the `useRouter` from `next/router` work.

Navigating to routes with params means you need to pass in both the `Url` and `as` parameters into `router.push` and `router.replace`.

```ts
router.push(
  {
    pathname: '/posts/[id]',
    query: {
      id: '2',
    },
  },
  {
    pathname: '/posts/2',
    query: {
      id: '2',
    },
  }
);
```

This library simplifies it down to:

```ts
pushRoute({
  pathname: '/posts/[id]',
  query: {
    id: '10',
  },
});
```

Which makes it easier for you to build up helpers to generate routes:

```ts
import { postsRoute } from './lib/routes';

pushRoute(postsRoute('2'));
```

Or using custom hooks to create links to routes:

```ts
function usePostsRoute(id: string) {
  const { createLink } = useRouter();
  return createLink({
    pathname: '/posts/[id]',
    query: {
      id,
    },
  });
}
```

```ts
const { href, onClick } = usePostsRoute('2');
```

Which eliminates most of the need for `<Link>`.

## Setup

You need to add the `<RouterProvider>` to your `pages/_app` file:

```tsx
import App from 'next/app';
import React from 'react';
import { RouterProvider } from 'next-router-provider';

export default class NextApp extends App {
  render(): JSX.Element {
    const { Component } = this.props;
    return (
      <RouterProvider>
        <Component />
      </RouterProvider>
    );
  }
}
```

## Usage

Once you've setup the provider you can use three hooks in your components:

- `useRouter`: A replacement for the `useRouter` from `next/router`.
- `useQuery`: Get a query/param from the URL.
- `usePrefetch`: Prefetch the assets for a route.

## API

### `Route`

The majority of the methods use a `Router` object. This is similar to the `Url` object that the Next.js accepts.

```ts
interface Route {
  pathname: string;
  query: Record<string, any>;
}
```

The `pathname` can include parameters and they will be automatically parsed out.

```ts
pushRoute({
  pathname: '/posts/[id]',
  query: {
    id: '10',
    hello: 'world',
  },
});
```

### RouteLink

Returned by `createLink`. This can be used on anchors and buttons.

```ts
interface RouteLink {
  isActive: boolean;
  push: () => void;
  replace: () => void;
  onClick: ClickHandler;
  href: string;
}
```

### `useRouter(): RouterHook`

Access the Next.js from the `RouterProvider`. Returns `RouterHook`.

#### `RouterHook`

- `getQuery<T>(key: string): T`: Get a query parameter from the router
- `pushRoute(route: Route): void`: Navigate to a `Route`.
- `router`: The Next.js router
- `replaceRoute(route: Route): void`
- `createLink(route: Route): RouteLink`: Takes a route and returns a `RouteLink`.
- `createHref(route: Route): string`: Takes a route object and returns a valid href.
- `createClickHandler(route: Route): void`: Returns a click handler for a route that can be used on a link or anchor. This will respect clicks while holding modifier keys.
- `isRouteActive(pathname: string): boolean`: Returns true if the route is active.

### `useQuery<T>(key: string): T`

Access a query string value and set it's type.

```ts
const id = useQuery<string>('id');
```

### `usePrefetch(pathname: string): void`

Calls `route.prefetch` on the route.

```ts
usePrefetch('/posts/[id]');
```
