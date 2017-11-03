export default class ListMap<K, V> {
  private map: Map<K, V[]>;

  public constructor() {
    this.map = new Map();
  }

  public addToList(key: K, value: V): void {
    let list = this.map.get(key);
    if (!list) {
      list = [];
      this.map.set(key, list);
    }
    list.push(value);
  }

  public getList(key: K): V[] | undefined {
    return this.map.get(key);
  }

  public removeFromList(key: K, value: V): void {
    const list = this.getList(key);
    if (!list) return;

    const idx = list.indexOf(value);
    if (idx < 0) return;

    list.splice(idx, 1);
  }
}
