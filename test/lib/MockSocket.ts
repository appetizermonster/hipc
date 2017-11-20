import { createMockedInstance } from '../MockUtils';

export class MockSocket {
  public connect(socketPath: string) {}
  public setEncoding(encoding: string) {}
  public on(eventName: string, handler: Function) {}
}

export function createMockSocket(): MockSocket {
  return createMockedInstance(MockSocket);
}
