import uuid from 'uuid/v4';

import RxUtils from './lib/RxUtils';
import { IRpcClientOptions } from './RpcClient';
import {
  AsyncFunction,
  ICallPayload,
  IChannelClient,
  IReplyPayload
} from './types';

export default class RpcServiceProxyHandler implements ProxyHandler<{}> {
  private channel: IChannelClient;
  private serviceName: string;
  private opts: IRpcClientOptions;
  private proxyFuncs: Map<string, AsyncFunction> = new Map();

  public constructor(
    channel: IChannelClient,
    serviceName: string,
    opts: IRpcClientOptions = {}
  ) {
    this.channel = channel;
    this.serviceName = serviceName;
    this.opts = opts;
  }

  public get(target: {}, key: any, receiver: any): any {
    if (!this.proxyFuncs.has(key)) {
      const proxyFunc = this.createProxyFunction(key);
      this.proxyFuncs.set(key, proxyFunc);
    }
    return this.proxyFuncs.get(key);
  }

  private createProxyFunction(funcName: string): AsyncFunction {
    const channel = this.channel;
    const serviceName = this.serviceName;
    const opts = this.opts;

    const proxyFunc = async (...args: any[]) => {
      const id = uuid();
      const funcPayload: ICallPayload = {
        id,
        serviceName,
        funcName,
        args
      };
      channel.send('#func', funcPayload);

      const observable = RxUtils.observableFromChannelClient<IReplyPayload>(
        channel,
        '#func-reply'
      );
      const timeoutSec = opts.timeoutSeconds || 5;
      const replyPayload = await observable
        .filter(p => p.id === id)
        .timeout(timeoutSec * 1000)
        .take(1)
        .toPromise();
      if (replyPayload.error) {
        throw new Error(replyPayload.error);
      }
      return replyPayload.returnValue;
    };
    return proxyFunc;
  }
}
