import {
  ICallPayload,
  IChannelSender,
  IChannelServer,
  IIpcServer,
  IIpcService,
  IIpcServiceRegistry,
  IReplyPayload
} from './types';

export default class IpcServer implements IIpcServer {
  private channel: IChannelServer;
  private services: Map<string, IIpcService> = new Map();

  public constructor(channel: IChannelServer) {
    this.channel = channel;
  }

  public async start(): Promise<void> {
    await this.channel.start();

    this.channel.listen('#func', this.handleFunctionCall.bind(this));
  }

  public addService(name: string, service: IIpcService): void {
    this.services.set(name, service);
  }

  private async handleFunctionCall(
    sender: IChannelSender,
    payload: {}
  ): Promise<void> {
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

    sender.send('#func-reply', replyPayload);
  }

  private async callFunction(
    serviceName: string,
    funcName: string,
    args: any[]
  ): Promise<any> {
    const service: any = this.services.get(serviceName);
    if (!service) {
      throw new Error(`Can't find a service: ${serviceName}`);
    }

    const func = this.findFunctionFromService(service, funcName);
    if (!func) {
      throw new Error(`Can't find a function in ${serviceName}: ${funcName}`);
    }

    const returnValue = await func.apply(service, args);
    return returnValue;
  }

  private findFunctionFromService(
    service: IIpcService,
    funcName: string
  ): Function | undefined {
    return (service as any)[funcName];
  }
}
