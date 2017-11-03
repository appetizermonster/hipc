import ListMap from '../../lib/ListMap';
import {
  ClientTopicHandler,
  IChannelClient,
  IChannelSender
} from '../../types';
import central from './central';
import { ILocalChannelServer } from './types';

export default class LocalChannelClient implements IChannelClient {
  private channelName: string;
  private connectedServer: ILocalChannelServer | null;
  private handlerListMap: ListMap<string, ClientTopicHandler>;
  private sender: IChannelSender;

  public constructor(channelName: string) {
    this.channelName = channelName;
    this.connectedServer = null;
    this.handlerListMap = new ListMap();

    const self = this;
    this.sender = {
      send: (topic, payload) => self.emit(topic, payload)
    };
  }

  public async connect(): Promise<void> {
    if (!central.isServerRunning(this.channelName))
      throw new Error('Cannot find a server');

    this.connectedServer = central.getServer(this.channelName);
  }

  public send(topic: string, payload: {}): void {
    const server = this.connectedServer;
    if (!server) throw new Error('Not connected');

    server.emit(topic, this.sender, payload);
  }

  public listen(topic: string, handler: ClientTopicHandler): void {
    const server = this.connectedServer;
    if (!server) throw new Error('Not connected');

    this.handlerListMap.addToList(topic, handler);
  }

  public unlisten(topic: string, handler: ClientTopicHandler): void {
    if (!this.connectedServer) throw new Error('Not connected');

    this.handlerListMap.removeFromList(topic, handler);
  }

  private emit(topic: string, payload: {}): void {
    const handlers = this.handlerListMap.getList(topic);
    if (!handlers) return;

    for (const handler of handlers) {
      handler(payload);
    }
  }
}
