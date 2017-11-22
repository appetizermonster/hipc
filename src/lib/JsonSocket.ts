import net from 'net';

import ListMap from './ListMap';
import RxUtils from './RxUtils';

export type JsonSocketEventName = 'message';
export const JSON_BUFFER_SEPARATOR = '@';

export default class JsonSocket {
  private socket: net.Socket;
  private listenersByEvents: ListMap<string, Function>;
  private jsonBuffer: JsonSocketBuffer;

  public constructor(socket: net.Socket) {
    this.socket = socket;
    this.socket.setEncoding('utf-8');

    this.listenersByEvents = new ListMap();
    this.jsonBuffer = new JsonSocketBuffer();
  }

  public async connectIpc(socketPath: string): Promise<void> {
    this.socket.on('data', this.onSocketData.bind(this));
    this.socket.on('error', this.onSocketError.bind(this));
    this.socket.connect(socketPath);

    await RxUtils.observableFromEvent(this.socket, 'connect')
      .take(1)
      .timeout(1000)
      .toPromise();
  }

  public on(eventName: JsonSocketEventName, listener: Function) {
    this.listenersByEvents.addToList(eventName, listener);
  }

  public removeListener(eventName: string, listener: Function) {
    this.listenersByEvents.removeFromList(eventName, listener);
  }

  private onSocketData(data: string): void {
    this.jsonBuffer.write(data);

    const jsonObjects = this.jsonBuffer.readObjects();
    for (const jsonObject of jsonObjects) {
      this.emit('message', jsonObject);
    }
  }

  private onSocketError(e: Error): void {
    console.error(e);
  }

  private emit(eventName: JsonSocketEventName, ...args: any[]) {
    const listeners = this.listenersByEvents.getList(eventName);
    if (listeners) {
      for (const listener of listeners) {
        listener.apply(this, args);
      }
    }
  }
}

class JsonSocketBuffer {
  private buffer: string = '';

  public write(data: string) {
    this.buffer += data;
  }

  public readObjects(): any[] {
    const result = [];
    while (true) {
      const obj = this.readObject();
      if (!obj) {
        break;
      }
      result.push(obj);
    }
    return result;
  }

  private readObject(): any | null {
    if (this.buffer.length <= 0) {
      return null;
    }

    const separatorIdx = this.buffer.indexOf(JSON_BUFFER_SEPARATOR);
    if (separatorIdx < 0) {
      return null;
    }

    const headLength = separatorIdx;
    const contentLengthStr = this.buffer.substr(0, headLength);
    const contentLength = parseInt(contentLengthStr, 10);
    const totalLength = headLength + 1 + contentLength;
    if (this.buffer.length < totalLength) {
      return null;
    }

    const contentStart = separatorIdx + 1;
    const contentJson = this.buffer.substr(contentStart, contentLength);
    const obj = JSON.parse(contentJson);
    if (!obj) {
      throw new Error("Can't parse the content json");
    }

    const nextContentStart = contentStart + contentLength;
    this.buffer = this.buffer.substr(nextContentStart);
    return obj;
  }
}
