import { IChannelServer, ServerTopicHandler } from '../../types';
import SocketUtils from './SocketUtils';

export default class SocketChannelServer implements IChannelServer {
  private socketPath: string;

  public constructor(identifier: string) {
    this.socketPath = SocketUtils.getSocketPath(identifier);
  }

  public async start(): Promise<void> {}

  public listen(topic: string, handler: ServerTopicHandler): void {}

  public unlisten(topic: string, handler: ServerTopicHandler): void {}
}
