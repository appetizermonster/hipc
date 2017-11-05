import {
  ICallPayload,
  IChannelServer,
  IReplyPayload,
  IRpcServer,
  IRpcService,
  IRpcServiceRegistry
} from './types';

export default class RpcServer implements IRpcServer {
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
    const service: any = this.findServiceFromRegistries(serviceName);
    if (!service) throw new Error(`Can't find a service: ${serviceName}`);

    const func = this.findFunctionFromService(service, funcName);
    if (!func)
      throw new Error(`Can't find a function in ${serviceName}: ${funcName}`);

    const returnValue = await func.apply(service, args);
    return returnValue;
  }

  private findServiceFromRegistries(serviceName: string): IRpcService | null {
    for (const registry of this.registries) {
      const s = registry.getService(serviceName);
      if (s) return s;
    }
    return null;
  }

  private findFunctionFromService(
    service: IRpcService,
    funcName: string
  ): Function | undefined {
    return (service as any)[funcName];
  }
}
