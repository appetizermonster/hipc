import * as uuid from 'uuid/v4';

import {
  AsyncFunction,
  ICallPayload,
  IChannelClient,
  IChannelServer,
  IReplyPayload,
  IRpcClient,
  IRpcServer,
  IRpcService,
  IRpcServiceRegistry
} from './types';

import * as utils from './utils';

class RpcServer implements IRpcServer {
  private channel: IChannelServer;
  private registries: IRpcServiceRegistry[];

  public constructor(channel: IChannelServer) {
    this.channel = channel;
    this.registries = [];
  }

  public async start(): Promise<void> {
    await this.channel.start();

    this.channel.listen('#func', this.handleFunctionCall.bind(this));
  }

  public addRegistry(serviceRegistry: IRpcServiceRegistry): void {
    this.registries.push(serviceRegistry);
  }

  private async handleFunctionCall(payload: {}): Promise<void> {
    const funcPayload = payload as ICallPayload;
    const replyPayload: IReplyPayload = {
      id: funcPayload.id,
      returnValue: null,
      error: null
    };

    try {
      const func = await this.callFunction(
        funcPayload.serviceName,
        funcPayload.funcName,
        funcPayload.args
      );
      replyPayload.returnValue = func;
    } catch (e) {
      replyPayload.error = e.toString();
    }

    this.channel.send('#func-reply', replyPayload);
  }

  private async callFunction(
    serviceName: string,
    funcName: string,
    args: any[]
  ): Promise<any> {
    const registries = this.registries;
    let service: any;

    // Find service
    for (const registry of registries) {
      const s = registry.getService(serviceName);
      if (s) service = s;
    }
    if (!service) throw new Error(`Can't find a service: ${serviceName}`);

    // Find function
    const func = service[funcName];
    if (!func)
      throw new Error(`Can't find a function in ${serviceName}: ${funcName}`);

    const returnValue = await func.apply(service, args);
    return returnValue;
  }
}

class RpcServiceProxyHandler implements ProxyHandler<{}> {
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

export interface IRpcClientOptions {
  timeoutSeconds?: number;
}

class RpcClient implements IRpcClient {
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
    if (!this.isConnected) throw new Error(`Client isn't connected yet`);

    const proxyHandler = new RpcServiceProxyHandler(
      this.channel,
      this.opts,
      serviceName
    );
    return (new Proxy({}, proxyHandler) as any) as T;
  }
}

class RpcServiceRegistry implements IRpcServiceRegistry {
  private services: Map<string, IRpcService>;

  public constructor() {
    this.services = new Map();
  }

  public addService(name: string, service: IRpcService): void {
    this.services.set(name, service);
  }

  public getService(name: string): IRpcService | null {
    const service = this.services.get(name);
    if (!service) return null;
    return service;
  }
}

export const createServiceRegistry = () => new RpcServiceRegistry();
export const createServer = (channel: IChannelServer) => new RpcServer(channel);
export const createClient = (
  channel: IChannelClient,
  opts: IRpcClientOptions = {}
) => new RpcClient(channel, opts);
