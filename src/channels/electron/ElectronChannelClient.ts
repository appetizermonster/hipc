import { IElectronChannelObserver, IElectronChannelSender } from './types';
import { ClientTopicHandler, IChannelClient } from '../../types';

export default class ElectronChannelClient implements IChannelClient {
  private observer: IElectronChannelObserver;
  private sender: IElectronChannelSender;

  public constructor(observer: IElectronChannelObserver, sender: IElectronChannelSender) {
    this.observer = observer;
    this.sender = sender;
  }

  public async connect(): Promise<void> {

  }

  public send(topic: string, payload: {}): void {}

  public listen(topic: string, handler: ClientTopicHandler): void {}

  public unlisten(topic: string, handler: ClientTopicHandler): void {}
}
