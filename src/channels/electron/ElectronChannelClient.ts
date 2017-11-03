import { ClientTopicHandler, IChannelClient } from '../../types';

export default class ElectronChannelClient implements IChannelClient {
  public constructor() {}

  public async connect(): Promise<void> {}

  public send(topic: string, payload: {}): void {}

  public listen(topic: string, handler: ClientTopicHandler): void {}

  public unlisten(topic: string, handler: ClientTopicHandler): void {}
}
