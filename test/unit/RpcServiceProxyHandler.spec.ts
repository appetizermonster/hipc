import LocalChannelClient from 'channels/local/LocalChannelClient';
import LocalChannelServer from 'channels/local/LocalChannelServer';
import RpcServer from 'RpcServer';
import RpcServiceProxyHandler from 'RpcServiceProxyHandler';
import { AsyncFunction, IRpcService } from 'types';
import MockChannelClient from '../helpers/MockChannelClient';
import { wrapFunctionsWithMockFn } from '../helpers/MockUtils';

class DummyService implements IRpcService {
  public async add(a: number, b: number): Promise<number> {
    return a + b;
  }
  public async testError(): Promise<void> {
    throw new Error('Test error');
  }
}

describe('RpcServiceProxyHandler', () => {
  describe('#get', () => {
    it('should return proxy function', () => {
      const mockChannel = wrapFunctionsWithMockFn(new MockChannelClient());
      const proxyHandler = new RpcServiceProxyHandler(mockChannel, 'service');
      const proxyFunc = proxyHandler.get({}, 'testfunc', {});
      expect(proxyFunc).toBeInstanceOf(Function);
    });
  });

  describe('#proxyFunction', () => {
    it('should call the remote function on server', async () => {
      const channelName = 'proxyFunction-success';
      const serviceName = 'service';

      const channelServer = new LocalChannelServer(channelName);
      const server = new RpcServer(channelServer);
      const service = new DummyService();
      server.addService(serviceName, service);
      server.start();

      const channelClient = new LocalChannelClient(channelName);
      await channelClient.connect();

      const proxyHandler = new RpcServiceProxyHandler(
        channelClient,
        serviceName
      );
      const remoteFunc = proxyHandler.get({}, 'add', {}) as AsyncFunction;
      const received = await remoteFunc(1, 2);
      const expected = await service.add(1, 2);
      expect(received).toEqual(expected);
    });

    it('should reject if the remote function throw error', async () => {
      const channelName = 'proxyFunction-error';
      const serviceName = 'service';

      const channelServer = new LocalChannelServer(channelName);
      const server = new RpcServer(channelServer);
      const service = new DummyService();
      server.addService(serviceName, service);
      server.start();

      const channelClient = new LocalChannelClient(channelName);
      await channelClient.connect();

      const proxyHandler = new RpcServiceProxyHandler(
        channelClient,
        serviceName
      );
      const remoteFunc = proxyHandler.get({}, 'testError', {}) as AsyncFunction;
      await expect(remoteFunc()).rejects.toBeDefined();
    });
  });
});
