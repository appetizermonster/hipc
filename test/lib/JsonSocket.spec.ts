import net from 'net';
import JsonSocket from '../../src/lib/JsonSocket';

describe('JsonSocket', () => {
  describe('constructor', () => {
    it('should accept net.Socket Instance as a parameter', () => {
      const jsonSocket = new JsonSocket(({} as any) as net.Socket);
      expect(jsonSocket).toBeDefined();
    });
  });

  describe('connectIpc', () => {
    it('should call socket.connect with socketPath', async () => {
      const mockSocket = {
        connect: jest.fn()
      };
      const socketPath = 'local-socket-path';
      const jsonSocket = new JsonSocket((mockSocket as any) as net.Socket);
      jsonSocket.connectIpc(socketPath);
      expect(mockSocket.connect).toBeCalledWith(socketPath);
    });
  });
});
