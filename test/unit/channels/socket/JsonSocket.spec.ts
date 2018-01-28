import net from 'net';

import JsonSocket, { compositeData } from 'channels/socket/JsonSocket';
import PromiseUtils from 'lib/PromiseUtils';
import MockSocket from '../../../helpers/MockSocket';
import { wrapFunctionsWithMockFn } from '../../../helpers/MockUtils';

describe('JsonSocket', () => {
  describe('#constructor', () => {
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

  describe('#connect', () => {
    it('should call socket.connect with socketPath', async () => {
      const mockSocket = wrapFunctionsWithMockFn(new MockSocket());
      const socketPath = 'testrpc';
      const jsonSocket = new JsonSocket((mockSocket as any) as net.Socket);
      await jsonSocket.connect(socketPath);
      expect(mockSocket.connect).toBeCalledWith(socketPath);
    });
  });

  describe('#close', () => {
    it('should throw error if not connected', () => {
      const mockSocket = wrapFunctionsWithMockFn(new MockSocket());
      const jsonSocket = new JsonSocket((mockSocket as any) as net.Socket);
      jsonSocket.close();

      const fn = () => jsonSocket.close();
      expect(fn).toThrowError();
    });

    it("should call 'end' function on the socket", async () => {
      const mockSocket = wrapFunctionsWithMockFn(new MockSocket());
      const jsonSocket = new JsonSocket((mockSocket as any) as net.Socket);
      await jsonSocket.connect('testrpc');
      jsonSocket.close();
      expect(mockSocket.end).toBeCalled();
    });
  });

  describe("#on('message')", () => {
    it('should parse json and emit messages', async () => {
      const mockSocket = wrapFunctionsWithMockFn(new MockSocket());
      const jsonSocket = new JsonSocket((mockSocket as any) as net.Socket);
      await jsonSocket.connect('testrpc');

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
      await jsonSocket.connect('testrpc');

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

  describe('#send', () => {
    it('should make json and write it to the socket', async () => {
      const mockSocket = wrapFunctionsWithMockFn(new MockSocket());
      const jsonSocket = new JsonSocket((mockSocket as any) as net.Socket);
      await jsonSocket.connect('testrpc');

      const sendingObj = { a: 1 };
      jsonSocket.send(sendingObj);

      const expectedJson = compositeData(sendingObj);
      expect(mockSocket.getWrittenBuffer()).toEqual(expectedJson);
    });

    it('should send json on drain event if buffer is full', async () => {
      const mockSocket = wrapFunctionsWithMockFn(new MockSocket());
      const jsonSocket = new JsonSocket((mockSocket as any) as net.Socket);
      await jsonSocket.connect('testrpc');

      const sendingObj = { a: 1 };
      mockSocket.setWriteable(false);
      jsonSocket.send(sendingObj);

      await PromiseUtils.delay(0.1);
      mockSocket.setWriteable(true);
      mockSocket.emit('drain');

      const expectedJson = compositeData(sendingObj);
      expect(mockSocket.getWrittenBuffer()).toEqual(expectedJson);
    });
  });
});
