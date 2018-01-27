import { IChannelClient } from 'types';

export default class MockChannelClient implements IChannelClient {
  public async connect(): Promise<void> {}
  public send(topic: string, payload: {}): void {}
  public listen(topic: string, handler: (payload: {}) => void): void {}
  public unlisten(topic: string, handler: (payload: {}) => void): void {}
}
