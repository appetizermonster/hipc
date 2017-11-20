import net from 'net';
import JsonSocket from '../../src/lib/JsonSocket';

import { createMockSocket } from './MockSocket';

describe('JsonSocket', () => {
  describe('constructor', () => {
    it('should accept net.Socket Instance as a parameter', () => {
      const mockSocket = createMockSocket();
      const jsonSocket = new JsonSocket(mockSocket as net.Socket);
      expect(jsonSocket).toBeDefined();
    });

    it("should set socket's encoding to utf-8", () => {
      const mockSocket = createMockSocket();
      const jsonSocket = new JsonSocket(mockSocket as net.Socket);
      expect(mockSocket.setEncoding).toBeCalledWith('utf-8');
    });
  });

  describe('connectIpc', () => {
    it('should call socket.connect with socketPath', async () => {
      const mockSocket = createMockSocket();
      const socketPath = 'testipc';
      const jsonSocket = new JsonSocket((mockSocket as any) as net.Socket);
      jsonSocket.connectIpc(socketPath);
      expect(mockSocket.connect).toBeCalledWith(socketPath);
    });
  });
});
