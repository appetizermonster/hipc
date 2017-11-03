import ListMap from '../../lib/ListMap';
import {
  IChannelSender,
  IChannelServer,
  ServerTopicHandler
} from '../../types';
import { ILocalChannelServer } from './types';

export default class LocalChannelServer
  implements IChannelServer, ILocalChannelServer {
  private channelName: string;
  private handlerListMap: ListMap<string, ServerTopicHandler>;
  private isStarted: boolean;

  public constructor(channelName: string) {
    this.channelName = channelName;
    this.handlerListMap = new ListMap();
    this.isStarted = false;
  }

  public async start(): Promise<void> {
    if (this.isStarted) throw new Error('Already started');
    this.isStarted = true;
  }

  public listen(topic: string, handler: ServerTopicHandler): void {
    this.handlerListMap.addToList(topic, handler);
  }

  public unlisten(topic: string, handler: ServerTopicHandler): void {
    this.handlerListMap.removeFromList(topic, handler);
  }

  public emit(topic: string, sender: IChannelSender, payload: {}): void {
    const handlers = this.handlerListMap.getList(topic);
    if (!handlers) return;

    for (const handler of handlers) {
      handler(sender, payload);
    }
  }
}
