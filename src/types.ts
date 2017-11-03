export type AsyncFunction = (...args: any[]) => Promise<any>;

export interface IRpcService {}

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

export interface IRpcServiceRegistry {
  addService(name: string, service: IRpcService): void;
  getService(name: string): IRpcService | null;
}

export interface IRpcServer {
  start(): Promise<void>;
  addRegistry(serviceRegistry: IRpcServiceRegistry): void;
}

export interface IRpcClient {
  connect(): Promise<void>;
  getServiceProxy<T extends IRpcService>(serviceName: string): T;
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
