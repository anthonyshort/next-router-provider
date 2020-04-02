import { createMockRouter } from '../src/helpers';

describe('createMockRouter', () => {
  it('should create a mock router', () => {
    const router = createMockRouter({
      pathname: '/admin/producer-dashboard/requests/[uuid]',
      query: {
        uuid: '1',
        hash: '12345',
      },
    });

    expect(router.asPath).toBe('/admin/producer-dashboard/requests/1?hash=12345');
    expect(router.route).toBe('/admin/producer-dashboard/requests/[uuid]');
    expect(router.query).toEqual({
      uuid: '1',
      hash: '12345',
    });
  });

  it('should allow spying on functions', () => {
    const router = createMockRouter({
      pathname: '/admin/producer-dashboard/requests/[uuid]',
      query: {
        uuid: '1',
        hash: '12345',
      },
    });

    const spy = jest.spyOn(router, 'push');
    router.push('/blah');
    expect(spy).toHaveBeenCalledWith('/blah');
  });

  it('should allow spying on push with multiple arguments', () => {
    const router = createMockRouter({
      pathname: '/admin/producer-dashboard/requests/[uuid]',
      query: {
        uuid: '1',
        hash: '12345',
      },
    });

    const spy = jest.spyOn(router, 'push');

    router.push(
      {
        pathname: '/users/[id]',
        query: {
          id: '1',
        },
      },
      {
        pathname: '/users/1',
        query: {
          id: '1',
        },
      },
    );

    expect(spy).toHaveBeenCalledWith(
      {
        pathname: '/users/[id]',
        query: {
          id: '1',
        },
      },
      {
        pathname: '/users/1',
        query: {
          id: '1',
        },
      },
    );
  });
});
