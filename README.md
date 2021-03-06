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

---

- [Install](#install)
- [Why?](#why)
- [Setup](#setup)
- [Usage](#usage)
  - [Mocking](#mocking)
- [API](#api)
  - [`Route`](#route)
  - [`RouteLink`](#routelink)
  - [`useRouter(): RouterHook`](#userouter-routerhook)
    - [`RouterHook`](#routerhook)
  - [`RouteOptions`](#routeoptions)
  - [`useQuery<T>(key: string): T`](#usequerytkey-string-t)
  - [`useRouteParam(key: string): string`](#userouteparamkey-string-string)
  - [`usePrefetch(route?: Route): void`](#useprefetchroute-route-void)

---

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

Once you've setup the provider you can use hooks in your components:

- `useRouter`: A replacement for the `useRouter` from `next/router`.
- `useQuery`: Get a query param from the URL.
- `useRouteParam`: Get a route param from the URL. This will throw if it doesn’t exist.
- `usePrefetch`: Prefetch the assets for a route.

In your components you can access the router. Here's a (mostly pointless) example that shows a few different ways to use the router hook.

```tsx
import { useRouter, usePrefetch } from 'next-router-provider';

const homeRoute = {
  pathname: '/'
}

const 4 = (id: string) => ({
  pathname: '/posts/[id]',
  query: {
    id
  }
})

function MyComponent() {
  const {
    pushRoute,
    replaceRoute,
    createLink,
    createHref,
    isRouteActive,
    createClickHandler,
  } = useRouter();

  // Get query parameter values. These can be typed but will default to Maybe<string>. This is useful when you know a query param will exist because it's part of the route.
  const searchFilter = useQuery('filter');

  // This will get the value of the route parameter. This will throw if the route param doesn't exist.
  const postId = useRouteParam('id');

  // Create a RouteLink. It has a lot of the same methods as the router but will point to a specific route.
  const homeLink = createLink(homeRoute);

  // Prefetch this bundle. If you have your own
  // Link component, you might put this in there and enable it using a prop.
  usePrefetch({
    pathname: '/'
  });

  // If there was a form submission...
  function onSubmit() {
    // ...save the form
    // Then navigate manually
    pushRoute({
      pathname: '/success'
    });
  }

  return (
    <nav>
      <a
        data-active={homeLink.isActive}
        href={homeLink.href}
        onClick={homeLink.onClick}
      >
        Home
      </a>
      {posts.map(post => {
        // If you wanted to do it manually
        const route = postsRoute(post.id);
        const href = createHref(route);
        const isActive = isRouteActive(route);
        const onClick = createClickHandler(route);

        return (
        <a
          data-active={isActive}
          href={href}
          onClick={onClick}
        >
          {post.title}
        </button>
      )
      })}
    </nav>
  );
}
```

### Mocking

One of the benefits of using providers like this is that we can easily mock the router in tests.

If you don't want to run assertions on route changes, you can simply use the `MockRouterProvider`:

```tsx
import { MockRouterProvider } from 'next-router-provider';

render(
  <MockRouterProvider pathname="/posts/[id]" query={{ hello: 'world' }}>
    <MyComponent />
  </MockRouterProvider>
);
```

Now whenever any of the hooks are used within these components they'll be using a fake router.

If you want to assert that route changes are happening you can use the context directly and create your own router.

```tsx
import { RouterContext, createMockRouter } from 'next-router-provider';

describe('Submitting the form', () => {
  it('should redirect after submit', () => {
    const router = createMockRouter({
      pathname: '/posts/new',
    });

    jest.spyOn(router, 'push');

    render(
      <RouterContext.Provider value={router}>
        <PostCreator />
      </RouterContext.Provider>
    );

    const submitButton = await findByText('Create new post');

    act(() => {
      fireEvent.click(submitButton);
    });

    expect(router.push).toHaveBeenCalledWith({
      pathname: '/post/success',
    });
  });
});
```

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

### `RouteLink`

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
- `pushRoute(route: Route, options?: RouteOptions): void`: Navigate to a `Route`.
- `router`: The Next.js router
- `replaceRoute(route: Route, options?: RouteOptions): void`
- `createLink(route: Route, options?: RouteOptions): RouteLink`: Takes a route and returns a `RouteLink`.
- `createHref(route: Route): string`: Takes a route object and returns a valid href.
- `createClickHandler(route: Route, options?: RouteOptions): void`: Returns a click handler for a route that can be used on a link or anchor. This will respect clicks while holding modifier keys.
- `isRouteActive(pathname: string): boolean`: Returns true if the route is active.

### `RouteOptions`

Pass through options to `router.push` and `router.replace`. The only option is `shallow: boolean`.

```ts
pushRoute(
  {
    pathname: '/',
  },
  {
    shallow: true,
  }
);
```

### `useQuery<T>(key: string): T`

Access a query string value and set it's type.

```ts
const id = useQuery<string>('id');
```

### `useRouteParam(key: string): string`

This will get the value of the route parameter. Unlike accessing the query in the built-in router this doesn't distinguish between route params and query params. This hook will look at the current route to make sure the parameter even exists and will always return a string.

```ts
const postId = useRouteParam('id');
```

### `usePrefetch(route?: Route): void`

Calls `route.prefetch` on the route.

```ts
usePrefetch({
  pathname: '/posts/[id]',
  query: {
    id: '10',
  },
});
```

Passing `undefined` or `null` will skip the effect.
