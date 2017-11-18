import net from 'net';

export default class JsonSocket {
  private socket: net.Socket;
  public constructor(socket: net.Socket) {
    this.socket = socket;
  }
  public connectIpc(socketPath: string) {
    this.socket.connect(socketPath);
  }
}
