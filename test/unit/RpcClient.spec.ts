import RpcClient from 'RpcClient';
import { IRpcService } from 'types';
import MockChannelClient from '../helpers/MockChannelClient';
import { wrapFunctionsWithMockFn } from '../helpers/MockUtils';

interface IDummyService extends IRpcService {
  dummyFunc(): void;
}

describe('RpcClient', () => {
  describe('#connect', () => {
    it('should call `connect` on the channel', async () => {
      const mockChannel = wrapFunctionsWithMockFn(new MockChannelClient());
      const client = new RpcClient(mockChannel);
      await client.connect();
      expect(mockChannel.connect).toBeCalled();
    });
  });

  describe('#getServiceProxy', () => {
    it('should throw error if not connected', () => {
      const mockChannel = wrapFunctionsWithMockFn(new MockChannelClient());
      const client = new RpcClient(mockChannel);
      const fn = () => client.getServiceProxy<IDummyService>('dummyService');
      expect(fn).toThrowError();
    });

    it('should return serviceProxy', async () => {
      const mockChannel = wrapFunctionsWithMockFn(new MockChannelClient());
      const client = new RpcClient(mockChannel);
      await client.connect();

      const dummyService = client.getServiceProxy<IDummyService>(
        'dummyService'
      );
      expect(dummyService).toBeDefined();
    });
  });
});
