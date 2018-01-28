import RpcClient, { IRpcClientOptions } from './RpcClient';
import RpcServer from './RpcServer';
import { IChannelClient, IChannelServer } from './types';

export const createServer = (channel: IChannelServer) => new RpcServer(channel);
export const createClient = (
  channel: IChannelClient,
  opts: IRpcClientOptions = {}
) => new RpcClient(channel, opts);
