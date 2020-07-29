import {
  createMockRouter,
  replaceParams,
  pushRoute,
  findParams,
} from '../src/helpers';

describe('Next router helpers', () => {
  describe('findParams', () => {
    it('should find all of the params in a string', () => {
      expect(
        findParams('/admin/producer-dashboard/[uuid]/page/[page]')
      ).toEqual(['uuid', 'page']);
      expect(findParams('/admin/producer-dashboard/[uuid]')).toEqual(['uuid']);
      expect(findParams('/admin/producer-dashboard/')).toEqual([]);
    });
  });

  describe('replaceParams', () => {
    it('should return the original string if there are no params', () => {
      expect(replaceParams('/admin/producer-dashboard')).toBe(
        '/admin/producer-dashboard'
      );
      expect(replaceParams('/admin/producer-dashboard/[uuid]')).toBe(
        '/admin/producer-dashboard/[uuid]'
      );
      expect(replaceParams('/admin/producer-dashboard/[uuid]', {})).toBe(
        '/admin/producer-dashboard/[uuid]'
      );
    });
    it('should replace params if they exist', () => {
      const result = replaceParams('/admin/producer-dashboard/[page]/[uuid]', {
        uuid: '1',
        unused: '2',
      });
      expect(result).toBe('/admin/producer-dashboard/[page]/1');
    });
  });

  describe('pushRoute', () => {
    it('should call router push', async () => {
      const router = createMockRouter({
        pathname: '/',
      });
      const spy = jest.spyOn(router, 'push');
      await pushRoute(
        router,
        {
          pathname: '/admin/producer-dashboard/[uuid]',
          query: {
            uuid: '1',
            tab: 'requests',
          },
        },
        {
          shallow: true,
        }
      );
      expect(spy).toHaveBeenCalled();
      expect(spy).toHaveBeenLastCalledWith(
        {
          pathname: '/admin/producer-dashboard/[uuid]',
          query: {
            uuid: '1',
            tab: 'requests',
          },
        },
        {
          pathname: '/admin/producer-dashboard/1',
          query: {
            tab: 'requests',
          },
        },
        {
          shallow: true,
        }
      );
    });
  });
});
