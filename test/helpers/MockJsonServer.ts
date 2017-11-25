import net from 'net';

import SocketUtils from '../../src/channels/socket/SocketUtils';
import JsonSocket from '../../src/lib/JsonSocket';

export default class MockJsonServer {
  private socketPath: string;

  private server: net.Server | null;
  private connectedSocket: JsonSocket | null;
  private socketDataEventHandler: Function | null;

  public constructor(socketId: string) {
    this.socketPath = SocketUtils.getSocketPath(socketId);

    this.server = null;
    this.connectedSocket = null;
    this.socketDataEventHandler = null;
  }

  public listen(eventHandler: (obj: any) => void) {
    this.server = new net.Server();
    this.server.on('connection', this.onServerConnection.bind(this));
    this.server.listen(this.socketPath);
    this.socketDataEventHandler = eventHandler;
  }

  public sendToConnectedSocket(obj: any): void {
    if (!this.connectedSocket) throw new Error('no connected socket');
    this.connectedSocket.send(obj);
  }

  public close() {
    if (this.server) {
      this.server.close();
      this.server = null;
    }

    if (this.connectedSocket) {
      this.connectedSocket.close();
      this.connectedSocket = null;
    }
  }

  private onServerConnection(socket: net.Socket) {
    const jsonSocket = new JsonSocket(socket);
    this.connectedSocket = jsonSocket;
    this.connectedSocket.on('message', this.onSocketMessage.bind(this));
  }

  private onSocketMessage(obj: any) {
    if (this.socketDataEventHandler) {
      this.socketDataEventHandler(obj);
    }
  }
}
