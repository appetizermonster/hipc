import uuid from 'uuid/v4';

import { IRpcClientOptions } from './RpcClient';
import {
  AsyncFunction,
  ICallPayload,
  IChannelClient,
  IReplyPayload
} from './types';
import * as utils from './utils';

export default class RpcServiceProxyHandler implements ProxyHandler<{}> {
  private channel: IChannelClient;
  private opts: IRpcClientOptions;
  private serviceName: string;
  private proxyFuncs: Map<string, AsyncFunction>;

  public constructor(
    channel: IChannelClient,
    opts: IRpcClientOptions,
    serviceName: string
  ) {
    this.channel = channel;
    this.opts = opts;
    this.serviceName = serviceName;
    this.proxyFuncs = new Map();
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

      const observable = utils.observableFromChannel<IReplyPayload>(
        channel,
        '#func-reply'
      );
      const timeoutSec = opts.timeoutSeconds || 5;
      const replyPayload = await observable
        .filter(p => p.id === id)
        .timeout(timeoutSec * 1000)
        .take(1)
        .toPromise();
      if (replyPayload.error) throw new Error(replyPayload.error);
      return replyPayload.returnValue;
    };
    return proxyFunc;
  }
}
