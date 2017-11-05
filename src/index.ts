import RpcClient from './RpcClient';
import { IRpcClientOptions } from './RpcClient';
import RpcServer from './RpcServer';
import RpcServiceRegistry from './RpcServiceRegistry';
import { IChannelClient, IChannelServer } from './types';

export const createServiceRegistry = () => new RpcServiceRegistry();
export const createServer = (channel: IChannelServer) => new RpcServer(channel);
export const createClient = (
  channel: IChannelClient,
  opts: IRpcClientOptions = {}
) => new RpcClient(channel, opts);
