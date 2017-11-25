import RpcClient from '../../src/RpcClient';
import { IChannelClient, IRpcService } from '../../src/types';

interface IDummyService extends IRpcService {
  dummyFunc(): void;
}

function createMockChannel(): IChannelClient {
  return ({
    connect: jest.fn(() => Promise.resolve())
  } as any) as IChannelClient;
}

describe('RpcClient', () => {
  describe('connect', () => {
    it('should call `connect` on the channel', async () => {
      const mockChannel = createMockChannel();
      const client = new RpcClient(mockChannel);
      await client.connect();
      expect(mockChannel.connect).toBeCalled();
    });
  });

  describe('getServiceProxy', () => {
    it('should throw error if not connected', () => {
      const mockChannel = createMockChannel();
      const client = new RpcClient(mockChannel);
      const fn = () => client.getServiceProxy<IDummyService>('dummyService');
      expect(fn).toThrowError();
    });

    it('should return serviceProxy', async () => {
      const mockChannel = createMockChannel();
      const client = new RpcClient(mockChannel);
      await client.connect();

      const dummyService = client.getServiceProxy<IDummyService>(
        'dummyService'
      );
      expect(dummyService).toBeDefined();
    });
  });
});
