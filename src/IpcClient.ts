import IpcServiceProxyHandler from './IpcServiceProxyHandler';
import { IChannelClient, IIpcClient, IIpcService } from './types';

export interface IIpcClientOptions {
  timeoutSeconds?: number;
}

export default class IpcClient implements IIpcClient {
  private channel: IChannelClient;
  private opts: IIpcClientOptions;
  private isConnected: boolean;

  public constructor(channel: IChannelClient, opts: IIpcClientOptions = {}) {
    this.channel = channel;
    this.opts = opts;
    this.isConnected = false;
  }

  public async connect(): Promise<void> {
    await this.channel.connect();
    this.isConnected = true;
  }

  public getServiceProxy<T extends IIpcService>(serviceName: string): T {
    if (!this.isConnected) {
      throw new Error(`Client isn't connected yet`);
    }

    const proxyHandler = new IpcServiceProxyHandler(
      this.channel,
      serviceName,
      this.opts
    );
    return (new Proxy({}, proxyHandler) as any) as T;
  }
}
