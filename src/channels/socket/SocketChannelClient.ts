import net from 'net';
import Rx from 'rxjs';

import { ClientTopicHandler, IChannelClient } from '../../types';
import SocketUtils from './SocketUtils';

function observableFromSocketEvent(
  socket: net.Socket,
  eventName: string
): Rx.Observable<any> {
  return Rx.Observable.create((observer: Rx.Observer<any>) => {
    const listener = (evt: any) => observer.next(evt);
    socket.on(eventName, listener);
    return () => socket.removeListener(eventName, listener);
  });
}

export default class SocketChannelClient implements IChannelClient {
  private socketPath: string;
  private socket: net.Socket | null;

  public constructor(identifier: string) {
    this.socketPath = SocketUtils.getSocketPath(identifier);
    this.socket = null;
  }

  public async connect(): Promise<void> {
    this.socket = new net.Socket();
    this.socket.setEncoding('utf8');
    this.socket.on('error', this.onError.bind(this));
    this.socket.connect(this.socketPath);

    await observableFromSocketEvent(this.socket, 'connect')
      .take(1)
      .timeout(1000)
      .toPromise();
  }

  public close(): void {
    if (this.socket) {
      this.socket.end();
      this.socket = null;
    }
  }

  public send(topic: string, payload: {}): void {
    if (!this.socket) throw new Error('not connected');

    const data = { topic, payload };
    const json = JSON.stringify(data);
    this.socket!.write(json);
  }

  public listen(topic: string, handler: ClientTopicHandler): void {}

  public unlisten(topic: string, handler: ClientTopicHandler): void {}

  private onError(e: any): void {
    console.error(e);
  }
}
