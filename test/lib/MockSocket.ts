import { setImmediate } from 'timers';
import ListMap from '../../src/lib/ListMap';

export type MockSocketEventName = 'connect' | 'data' | 'drain';

export default class MockSocket {
  private listenersByEvents: ListMap<string, Function> = new ListMap();
  private onceListenersByEvents: ListMap<string, Function> = new ListMap();
  private writeable: boolean = true;
  private writtenBuffer: string = '';

  // net.Socket functions
  public connect(socketPath: string) {
    setImmediate(() => this.emit('connect'));
  }

  public setEncoding(encoding: string) {}

  public on(eventName: MockSocketEventName, listener: Function) {
    this.listenersByEvents.addToList(eventName, listener);
  }

  public once(eventName: MockSocketEventName, listener: Function) {
    this.onceListenersByEvents.addToList(eventName, listener);
  }

  public removeListener(eventName: string, listener: Function) {
    this.listenersByEvents.removeFromList(eventName, listener);
  }

  public write(data: string): boolean {
    if (!this.writeable) {
      return false;
    }

    this.writtenBuffer += data;
    return true;
  }

  public setWriteable(writeable: boolean) {
    this.writeable = writeable;
  }

  // Extra helpers
  public getWrittenBuffer() {
    return this.writtenBuffer.toString();
  }

  public emit(eventName: MockSocketEventName, ...args: any[]) {
    const listeners = this.listenersByEvents.getList(eventName);
    if (listeners) {
      for (const listener of listeners) {
        listener.apply(this, args);
      }
    }

    const onceListeners = this.onceListenersByEvents.getList(eventName);
    if (onceListeners) {
      for (const listener of onceListeners) {
        listener.apply(this, args);
      }
      this.onceListenersByEvents.removeList(eventName);
    }
  }
}
