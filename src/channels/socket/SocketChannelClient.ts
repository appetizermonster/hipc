import net = require('net');

import ListMap from 'lib/ListMap';
import RxUtils from 'lib/RxUtils';
import { ClientTopicHandler, IChannelClient } from 'types';
import JsonSocket from './JsonSocket';
import SocketUtils from './SocketUtils';

export default class SocketChannelClient implements IChannelClient {
  private socketPath: string;
  private jsonSocket: JsonSocket | null = null;
  private listenerListMap: ListMap<string, ClientTopicHandler> = new ListMap();

  public constructor(socketId: string) {
    this.socketPath = SocketUtils.getSocketPath(socketId);
  }

  public async connect(): Promise<void> {
    const socket = new net.Socket();
    this.jsonSocket = new JsonSocket(socket);
    await this.jsonSocket.connect(this.socketPath);

    // Handshaking
    this.jsonSocket.send({ type: 'hello' });
    await RxUtils.observableFromEvent(this.jsonSocket, 'message')
      .filter(obj => obj.type === 'hello-reply')
      .take(1)
      .timeout(1000)
      .toPromise();

    this.jsonSocket.on('message', this.onSocketMessage.bind(this));
  }

  public close(): void {
    if (this.jsonSocket) {
      this.jsonSocket.close();
      this.jsonSocket = null;
    }
  }

  public send(topic: string, payload: {}): void {
    if (!this.jsonSocket) {
      throw new Error("Socket isn't connected");
    }

    const data = { topic, payload };
    this.jsonSocket.send({ type: 'data', data });
  }

  public listen(topic: string, handler: ClientTopicHandler): void {
    this.listenerListMap.addToList(topic, handler);
  }

  public unlisten(topic: string, handler: ClientTopicHandler): void {
    this.listenerListMap.removeFromList(topic, handler);
  }

  private onSocketMessage(obj: any): void {
    if (obj.type === 'data') {
      const { topic, payload } = obj.data;
      const listeners = this.listenerListMap.getList(topic);
      if (listeners) {
        listeners.forEach(listener => listener(payload));
      }
    }
  }
}
