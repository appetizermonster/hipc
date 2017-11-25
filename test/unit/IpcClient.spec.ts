import IpcClient from '../../src/IpcClient';
import { IChannelClient, IIpcService } from '../../src/types';

interface IDummyService extends IIpcService {
  dummyFunc(): void;
}

function createMockChannel(): IChannelClient {
  return ({
    connect: jest.fn(() => Promise.resolve())
  } as any) as IChannelClient;
}

describe('IpcClient', () => {
  describe('connect', () => {
    it('should call `connect` on the channel', async () => {
      const mockChannel = createMockChannel();
      const client = new IpcClient(mockChannel);
      await client.connect();
      expect(mockChannel.connect).toBeCalled();
    });
  });

  describe('getServiceProxy', () => {
    it('should throw error if not connected', () => {
      const mockChannel = createMockChannel();
      const client = new IpcClient(mockChannel);
      const fn = () => client.getServiceProxy<IDummyService>('dummyService');
      expect(fn).toThrowError();
    });

    it('should return serviceProxy', async () => {
      const mockChannel = createMockChannel();
      const client = new IpcClient(mockChannel);
      await client.connect();

      const dummyService = client.getServiceProxy<IDummyService>(
        'dummyService'
      );
      expect(dummyService).toBeDefined();
    });
  });
});
