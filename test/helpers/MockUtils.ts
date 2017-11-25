export function wrapFunctionsWithMockFn<T extends any>(object: T): T {
  const prototype = Object.getPrototypeOf(object);
  const functionNames = Object.getOwnPropertyNames(prototype);
  for (const funcName of functionNames) {
    const funcImpl = prototype[funcName];
    object[funcName] = jest.fn(funcImpl);
  }
  return object;
}
