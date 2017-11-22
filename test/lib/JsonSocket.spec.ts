import net from 'net';

import JsonSocket, { JSON_BUFFER_SEPARATOR } from '../../src/lib/JsonSocket';
import { wrapFunctionsWithMockFn } from '../MockUtils';
import MockSocket from './MockSocket';

function compositeData(obj: any) {
  const json = JSON.stringify(obj);
  const jsonLength = json.length;
  const data = jsonLength.toString() + JSON_BUFFER_SEPARATOR + json;
  return data;
}

describe('JsonSocket', () => {
  describe('constructor', () => {
    it('should accept net.Socket Instance as a parameter', () => {
      const mockSocket = wrapFunctionsWithMockFn(new MockSocket());
      const jsonSocket = new JsonSocket((mockSocket as any) as net.Socket);
      expect(jsonSocket).toBeDefined();
    });

    it("should set socket's encoding to utf-8", () => {
      const mockSocket = wrapFunctionsWithMockFn(new MockSocket());
      const jsonSocket = new JsonSocket((mockSocket as any) as net.Socket);
      expect(mockSocket.setEncoding).toBeCalledWith('utf-8');
    });
  });

  describe('connectIpc', () => {
    it('should call socket.connect with socketPath', async () => {
      const mockSocket = wrapFunctionsWithMockFn(new MockSocket());
      const socketPath = 'testipc';
      const jsonSocket = new JsonSocket((mockSocket as any) as net.Socket);
      await jsonSocket.connectIpc(socketPath);
      expect(mockSocket.connect).toBeCalledWith(socketPath);
    });
  });

  describe("on('message')", () => {
    it('should parse and emit json messages', async () => {
      const mockSocket = wrapFunctionsWithMockFn(new MockSocket());
      const jsonSocket = new JsonSocket((mockSocket as any) as net.Socket);
      await jsonSocket.connectIpc('testipc');

      let receivedObject;
      jsonSocket.on('message', (obj: any) => {
        receivedObject = obj;
      });

      const sendingData = { a: 1, b: 'test' };
      const data = compositeData(sendingData);
      mockSocket.emit('data', data);

      expect(receivedObject).toMatchObject(sendingData);
    });
  });
});
