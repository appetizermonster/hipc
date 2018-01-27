import { IChannelSender } from 'types';

export interface ILocalChannelServer {
  emit(topic: string, sender: IChannelSender, payload: {}): void;
}
