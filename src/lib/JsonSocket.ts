import net from 'net';

export default class JsonSocket {
  private socket: net.Socket;
  public constructor(socket: net.Socket) {
    this.socket = socket;
    this.socket.setEncoding('utf-8');
  }
  public connectIpc(socketPath: string) {
    this.socket.connect(socketPath);
  }
}
