import net from 'net';

import ListMap from '../../../lib/ListMap';
import RxUtils from '../../RxUtils';
import { ClientTopicHandler, IChannelClient } from '../../types';
import SocketUtils from './SocketUtils';

export default class SocketChannelClient implements IChannelClient {
  private socketPath: string;
  private socket: net.Socket | null;
  private listenerListMap: ListMap<string, ClientTopicHandler>;

  public constructor(identifier: string) {
    this.socketPath = SocketUtils.getSocketPath(identifier);
    this.socket = null;
    this.listenerListMap = new ListMap();
  }

  public async connect(): Promise<void> {
    this.socket = new net.Socket();
    this.socket.setEncoding('utf8');
    this.socket.on('error', this.onSocketError.bind(this));
    this.socket.on('data', this.onSocketData.bind(this));
    this.socket.connect(this.socketPath);

    await RxUtils.observableFromEvent(this.socket, 'connect')
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

  public listen(topic: string, handler: ClientTopicHandler): void {
    this.listenerListMap.addToList(topic, handler);
  }

  public unlisten(topic: string, handler: ClientTopicHandler): void {
    this.listenerListMap.removeFromList(topic, handler);
  }

  private onSocketError(e: any): void {
    console.error(e);
  }

  private onSocketData(json: any): void {
    const data = JSON.parse(json);
    if (!data) return;

    const { topic, payload } = data;
    const listeners = this.listenerListMap.getList(topic);
    if (listeners) {
      listeners.forEach(x => x(payload));
    }
  }
}
