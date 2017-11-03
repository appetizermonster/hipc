import ListMap from '../ListMap';

describe('ListMap', () => {
  describe('addToList', () => {
    it('should create a list if no list', () => {
      const listMap = new ListMap<string, any>();
      listMap.addToList('a', {});

      expect(listMap.getList('a')).toBeDefined();
    });

    it('should be able to add item', () => {
      const listMap = new ListMap<string, any>();
      const item = {};
      listMap.addToList('a', item);

      const list = listMap.getList('a');
      expect(list!.indexOf(item)).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getList', () => {
    it("should return undefined if it doesn't exist", () => {
      const listMap = new ListMap<string, any>();
      expect(listMap.getList('x')).toBeUndefined();
    });

    it('should return a list if it exists', () => {
      const listMap = new ListMap<string, any>();
      listMap.addToList('x', 0);

      expect(listMap.getList('x')).toEqual([0]);
    });
  });

  describe('removeFromList', () => {
    it('should remove a item from the list', () => {
      const listMap = new ListMap<string, any>();
      const item = {};
      listMap.addToList('x', item);
      listMap.removeFromList('x', item);

      const list = listMap.getList('x');
      const isItemExists = list!.indexOf(item) >= 0;
      expect(isItemExists).toBeFalsy();
    });
  });
});
