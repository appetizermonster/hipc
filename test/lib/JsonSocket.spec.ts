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
    it('should parse json and emit messages', async () => {
      const mockSocket = wrapFunctionsWithMockFn(new MockSocket());
      const jsonSocket = new JsonSocket((mockSocket as any) as net.Socket);
      await jsonSocket.connectIpc('testipc');

      let receivedObject;
      jsonSocket.on('message', (obj: any) => (receivedObject = obj));

      const sendingObj = { a: 1, b: 'test' };
      const data = compositeData(sendingObj);
      mockSocket.emit('data', data);

      expect(receivedObject).toMatchObject(sendingObj);
    });

    it('should parse data which contains multiple json', async () => {
      const mockSocket = wrapFunctionsWithMockFn(new MockSocket());
      const jsonSocket = new JsonSocket((mockSocket as any) as net.Socket);
      await jsonSocket.connectIpc('testipc');

      const receivedObjects: any[] = [];
      jsonSocket.on('message', (obj: any) => receivedObjects.push(obj));

      const sendingObj1 = { a: 1 };
      const sendingObj2 = { b: 'abc' };
      const sendingObj3 = { a: 'abc', b: [0, 1, 2] };

      const data1 = compositeData(sendingObj1);
      const data2 = compositeData(sendingObj2);
      const data3 = compositeData(sendingObj3);

      mockSocket.emit('data', data1);
      mockSocket.emit('data', data2 + data3);

      expect(receivedObjects[0]).toMatchObject(sendingObj1);
      expect(receivedObjects[1]).toMatchObject(sendingObj2);
      expect(receivedObjects[2]).toMatchObject(sendingObj3);
    });
  });
});
