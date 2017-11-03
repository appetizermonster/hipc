import { LocalChannelClient, LocalChannelServer } from './channels/local';
import * as rpc from './index';
import { IRpcService } from './types';

interface ISimpleService extends IRpcService {
  log(message: string): Promise<void>;
}

class SimpleService implements ISimpleService {
  public async log(message: string): Promise<void> {
    console.log(`SimpleService: ${message}`);
  }
}

async function testService() {
  console.log(rpc);
  const registry = rpc.createServiceRegistry();
  registry.addService('simpleService', new SimpleService());

  // Server
  const server = rpc.createServer(new LocalChannelServer());
  server.addRegistry(registry);
  await server.start();

  // Client
  const client0 = rpc.createClient(new LocalChannelClient());
  const client1 = rpc.createClient(new LocalChannelClient());
  await client0.connect();
  await client1.connect();

  const service0 = client0.getServiceProxy<ISimpleService>('simpleService');
  const service1 = client1.getServiceProxy<ISimpleService>('simpleService');
  await service0.log('hello, world');
  await service0.log('this is second chance');
  await service1.log('this is service1');
}

testService().catch(console.error);
