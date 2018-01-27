import { IChannelSender, IChannelServer, ServerTopicHandler } from 'types';
import LocalChannelCentral from './LocalChannelCentral';
import { ILocalChannelServer } from './types';

export default class LocalChannelServer
  implements IChannelServer, ILocalChannelServer {
  private channelName: string;
  private handlersByTopic: Map<string, ServerTopicHandler[]> = new Map();
  private isStarted: boolean = false;

  public constructor(channelName: string) {
    this.channelName = channelName;
  }

  public async start(): Promise<void> {
    if (this.isStarted) {
      throw new Error('Already started');
    }
    LocalChannelCentral.addServer(this.channelName, this);
    this.isStarted = true;
  }

  public listen(topic: string, handler: ServerTopicHandler): void {
    let handlers = this.handlersByTopic.get(topic);
    if (!handlers) {
      handlers = [];
      this.handlersByTopic.set(topic, handlers);
    }
    handlers.push(handler);
  }

  public unlisten(topic: string, handler: ServerTopicHandler): void {
    const handlers = this.handlersByTopic.get(topic);
    if (!handlers) {
      return;
    }

    const idx = handlers.indexOf(handler);
    if (idx < 0) {
      return;
    }
    handlers.splice(idx, 1);
  }

  public emit(topic: string, sender: IChannelSender, payload: {}): void {
    const handlers = this.handlersByTopic.get(topic);
    if (!handlers) {
      return;
    }

    for (const handler of handlers) {
      handler(sender, payload);
    }
  }
}
