import net from 'net';

import JsonSocket from '../../lib/JsonSocket';
import ListMap from '../../lib/ListMap';
import {
  IChannelSender,
  IChannelServer,
  ServerTopicHandler
} from '../../types';
import SocketUtils from './SocketUtils';

function createSenderFromJsonSocket(jsonSocket: JsonSocket): IChannelSender {
  return {
    send: (topic, payload) => {
      const data = { topic, payload };
      jsonSocket.send({ type: 'data', data });
    }
  };
}

export default class SocketChannelServer implements IChannelServer {
  private socketPath: string;
  private server: net.Server | null = null;
  private listenerListMap: ListMap<string, ServerTopicHandler> = new ListMap();

  public constructor(socketId: string) {
    this.socketPath = SocketUtils.getSocketPath(socketId);
  }

  public async start(): Promise<void> {
    if (this.server) throw new Error('Server is already running');
    this.server = new net.Server();
    this.server.listen(this.socketPath);
    this.server.on('connection', this.onServerConnection.bind(this));
  }

  public close(): void {
    if (this.server) {
      this.server.close();
      this.server = null;
    }
  }

  public listen(topic: string, handler: ServerTopicHandler): void {
    this.listenerListMap.addToList(topic, handler);
  }

  public unlisten(topic: string, handler: ServerTopicHandler): void {
    this.listenerListMap.removeFromList(topic, handler);
  }

  private onServerConnection(socket: net.Socket) {
    const jsonSocket = new JsonSocket(socket);
    const channelSender = createSenderFromJsonSocket(jsonSocket);

    jsonSocket.on('message', (obj: any) => {
      const { type, data } = obj;
      switch (type) {
        case 'hello':
          jsonSocket.send({ type: 'hello-reply' });
          break;
        case 'data':
          const { topic, payload } = data;
          this.emit(topic, channelSender, payload);
          break;
      }
    });
  }

  private emit(topic: string, sender: IChannelSender, payload: {}) {
    const listeners = this.listenerListMap.getList(topic);
    if (listeners) {
      listeners.forEach(listener => listener(sender, payload));
    }
  }
}
