import * as rpc from '../src';
import LocalChannelClient from '../src/channels/local/LocalChannelClient';
import LocalChannelServer from '../src/channels/local/LocalChannelServer';
import { IIpcService } from '../src/types';

interface ISimpleService extends IIpcService {
  log(message: string): Promise<void>;
}

class SimpleService implements ISimpleService {
  public async log(message: string): Promise<void> {
    console.log(`SimpleService: ${message}`);
  }
}

async function testService() {
  // Server
  const channelName = 'testchannel';
  const serviceName = 'simpleservice';
  const server = rpc.createServer(new LocalChannelServer(channelName));
  server.addService(serviceName, new SimpleService());
  await server.start();

  // Client
  const client0 = rpc.createClient(new LocalChannelClient(channelName));
  const client1 = rpc.createClient(new LocalChannelClient(channelName));
  await client0.connect();
  await client1.connect();

  const service0 = client0.getServiceProxy<ISimpleService>(serviceName);
  const service1 = client1.getServiceProxy<ISimpleService>(serviceName);
  await service0.log('hello, world');
  await service0.log('this is second chance');
  await service1.log('this is service1');
}

testService().catch(console.error);
