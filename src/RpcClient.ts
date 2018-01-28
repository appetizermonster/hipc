import RpcServiceProxyHandler from './RpcServiceProxyHandler';
import { IChannelClient, IRpcClient, IRpcService } from './types';

export interface IRpcClientOptions {
  timeoutSeconds?: number;
}

export default class RpcClient implements IRpcClient {
  private channel: IChannelClient;
  private opts: IRpcClientOptions;
  private isConnected: boolean;

  public constructor(channel: IChannelClient, opts: IRpcClientOptions = {}) {
    this.channel = channel;
    this.opts = opts;
    this.isConnected = false;
  }

  public async connect(): Promise<void> {
    await this.channel.connect();
    this.isConnected = true;
  }

  public getServiceProxy<T extends IRpcService>(serviceName: string): T {
    if (!this.isConnected) {
      throw new Error(`Client isn't connected yet`);
    }

    const proxyHandler = new RpcServiceProxyHandler(
      this.channel,
      serviceName,
      this.opts
    );
    return (new Proxy({}, proxyHandler) as any) as T;
  }
}
