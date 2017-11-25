import {
  ClientTopicHandler,
  IChannelClient,
  IChannelSender
} from '../../types';
import LocalChannelCentral from './LocalChannelCentral';
import { ILocalChannelServer } from './types';

export default class LocalChannelClient implements IChannelClient {
  private channelName: string;
  private connectedServer: ILocalChannelServer | null = null;
  private handlers: Map<string, ClientTopicHandler[]> = new Map();
  private sender: IChannelSender;

  public constructor(channelName: string) {
    this.channelName = channelName;

    const self = this;
    this.sender = {
      send: (topic, payload) => self.emit(topic, payload)
    };
  }

  public async connect(): Promise<void> {
    if (!LocalChannelCentral.isServerRunning(this.channelName)) {
      throw new Error('Cannot find a server');
    }

    this.connectedServer = LocalChannelCentral.getServer(this.channelName);
  }

  public send(topic: string, payload: {}): void {
    const server = this.connectedServer;
    if (!server) {
      throw new Error('Not connected');
    }

    server.emit(topic, this.sender, payload);
  }

  public listen(topic: string, handler: ClientTopicHandler): void {
    const server = this.connectedServer;
    if (!server) {
      throw new Error('Not connected');
    }

    let handlers = this.handlers.get(topic);
    if (!handlers) {
      handlers = [];
      this.handlers.set(topic, handlers);
    }

    handlers.push(handler);
  }

  public unlisten(topic: string, handler: ClientTopicHandler): void {
    if (!this.connectedServer) {
      throw new Error('Not connected');
    }

    const handlers = this.handlers.get(topic);
    if (!handlers) {
      return;
    }

    const idx = handlers.indexOf(handler);
    if (idx < 0) {
      return;
    }

    handlers.splice(idx, 1);
  }

  private emit(topic: string, payload: {}): void {
    const handlers = this.handlers.get(topic);
    if (!handlers) {
      return;
    }

    for (const handler of handlers) {
      handler(payload);
    }
  }
}
