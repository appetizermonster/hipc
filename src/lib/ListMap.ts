export default class ListMap<K, V> {
  private map: Map<K, V[]>;
  public constructor() {
    this.map = new Map();
  }

  public getList(key: K): V[] | undefined {
    return this.map.get(key);
  }

  public addToList(key: K, element: V) {
    let list = this.getList(key);
    if (!list) {
      list = [];
      this.map.set(key, list);
    }
    list.push(element);
  }

  public removeFromList(key: K, element: V) {
    const list = this.getList(key);
    if (!list) throw new Error("can't find the element");

    const idx = list.indexOf(element);
    if (idx < 0) throw new Error("can't find the element");

    list.splice(idx, 1);
  }
}
