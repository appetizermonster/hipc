import net from 'net';

import SocketUtils from '../../../src/channels/socket/SocketUtils';

export default class MockServer {
  private socketPath: string;
  private encoding: string;

  private server: net.Server | null;
  private connectedSocket: net.Socket | null;
  private socketDataEventHandler: Function | null;

  public constructor(socketId: string, encoding: string = 'utf8') {
    this.socketPath = SocketUtils.getSocketPath(socketId);
    this.encoding = encoding;

    this.server = null;
    this.connectedSocket = null;
    this.socketDataEventHandler = null;
  }

  public listen(eventHandler: (data: any) => void) {
    this.server = new net.Server();
    this.server.on('connection', this.onConnection.bind(this));
    this.server.listen(this.socketPath);
    this.socketDataEventHandler = eventHandler;
  }

  public sendToConnectedSocket(data: string): void {
    if (!this.connectedSocket) throw new Error('no connected socket');
    this.connectedSocket.write(data);
  }

  public close() {
    if (this.server) {
      this.server.close();
      this.server = null;
    }

    if (this.connectedSocket) {
      this.connectedSocket.destroy();
      this.connectedSocket = null;
    }
  }

  private onConnection(socket: net.Socket) {
    this.connectedSocket = socket;

    socket.setEncoding(this.encoding);
    socket.on('data', this.onSocketDataEvent.bind(this));
  }

  private onSocketDataEvent(data: any) {
    if (this.socketDataEventHandler) this.socketDataEventHandler(data);
  }
}
