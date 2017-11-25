import IpcClient, { IIpcClientOptions } from './IpcClient';
import IpcServer from './IpcServer';
import IpcServiceRegistry from './IpcServiceRegistry';
import { IChannelClient, IChannelServer } from './types';

export const createServiceRegistry = () => new IpcServiceRegistry();
export const createServer = (channel: IChannelServer) => new IpcServer(channel);
export const createClient = (
  channel: IChannelClient,
  opts: IIpcClientOptions = {}
) => new IpcClient(channel, opts);
