import { setImmediate } from 'timers';
import ListMap from '../../src/lib/ListMap';

export type MockSocketEvent = 'connect' | 'data';

export default class MockSocket {
  private listenersByEvents: ListMap<string, Function> = new ListMap();

  // net.Socket functions
  public connect(socketPath: string) {
    setImmediate(() => this.emit('connect'));
  }

  public setEncoding(encoding: string) {}

  public on(eventName: MockSocketEventName, listener: Function) {
    this.listenersByEvents.addToList(eventName, listener);
  }

  public removeListener(eventName: string, listener: Function) {
    this.listenersByEvents.removeFromList(eventName, listener);
  }

  // Extra helpers
  public emit(eventName: MockSocketEventName, ...args: any[]) {
    const listeners = this.listenersByEvents.getList(eventName);
    if (listeners) {
      for (const listener of listeners) {
        listener.apply(this, args);
      }
    }
  }
}
