export function createMockedInstance<T>(Clazz: { new (): T }): T {
  const instance: any = new Clazz();
  const keys = Object.getOwnPropertyNames(Clazz.prototype);
  for (const funcName of keys) {
    const funcImpl = Clazz.prototype[funcName];
    instance[funcName] = jest.fn(funcImpl);
  }
  return instance;
}
