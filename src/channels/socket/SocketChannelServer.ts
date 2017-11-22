import net from 'net';

import ListMap from '../../lib/ListMap';
import { IChannelServer, ServerTopicHandler } from '../../types';
import SocketUtils from './SocketUtils';

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
    this.server.on('connection', this.onServerConnection);
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

  public unlisten(topic: string, handler: ServerTopicHandler): void {}

  private onServerConnection(socket: net.Socket) {
    socket.setEncoding('utf8');
    socket.on('data', (data: string) => {
      if (data === 'hello') {
        return socket.write('me-too');
      }
    });
  }
}
