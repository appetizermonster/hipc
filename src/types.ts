export type AsyncFunction = (...args: any[]) => Promise<any>;

export interface IIpcService {}

export interface ICallPayload {
  id: string;
  serviceName: string;
  funcName: string;
  args: any[];
}

export interface IReplyPayload {
  id: string;
  returnValue: any;
  error: string | null;
}

export interface IIpcServiceRegistry {
  addService(name: string, service: IIpcService): void;
  getService(name: string): IIpcService | null;
}

export interface IIpcServer {
  start(): Promise<void>;
  addRegistry(serviceRegistry: IIpcServiceRegistry): void;
}

export interface IIpcClient {
  connect(): Promise<void>;
  getServiceProxy<T extends IIpcService>(serviceName: string): T;
}

export type ClientTopicHandler = (payload: {}) => void;
export type ServerTopicHandler = (sender: IChannelSender, payload: {}) => void;

export interface IChannelSender {
  send(topic: string, payload: {}): void;
}

export interface IChannelClient {
  connect(): Promise<void>;
  send(topic: string, payload: {}): void;
  listen(topic: string, handler: ClientTopicHandler): void;
  unlisten(topic: string, handler: ClientTopicHandler): void;
}

export interface IChannelServer {
  start(): Promise<void>;
  listen(topic: string, handler: ServerTopicHandler): void;
  unlisten(topic: string, handler: ServerTopicHandler): void;
}
