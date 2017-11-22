import SocketChannelClient from '../../../src/channels/socket/SocketChannelClient';
import PromiseUtils from '../../../src/lib/PromiseUtils';
import MockJsonServer from './MockJsonServer';

describe('SocketChannelClient', () => {
  describe('connect', () => {
    it('should reject if server is not ready', async () => {
      const client = new SocketChannelClient('test');
      await expect(client.connect()).rejects.toBeDefined();
    });

    it('should resolve if server is ready', async () => {
      const socketId = 'testabc';
      const mockServer = new MockJsonServer(socketId);
      mockServer.listen((obj: any) => {
        if (obj.type === 'hello') {
          mockServer.sendToConnectedSocket({ type: 'hello-reply' });
        }
      });

      const client = new SocketChannelClient(socketId);
      await expect(client.connect()).resolves.toBeUndefined();

      client.close();
      mockServer.close();
    });
  });

  describe('send', () => {
    it("should throw error if it's not connected", () => {
      const client = new SocketChannelClient('testabc');
      const fn = () => client.send('topic', {});
      expect(fn).toThrowError();
    });

    it('should send payload over socket', async () => {
      const socketId = 'testabc123';
      const mockServer = new MockJsonServer(socketId);

      let receivedObj;
      mockServer.listen(obj => {
        if (obj.type === 'hello') {
          mockServer.sendToConnectedSocket({ type: 'hello-reply' });
        } else {
          receivedObj = obj;
        }
      });

      const client = new SocketChannelClient(socketId);
      await client.connect();

      const topic = 'mytopic';
      const payload = { a: 1 };
      client.send(topic, payload);
      await PromiseUtils.delay(0.01); // Wait for the sending delay

      const expectedObj = { type: 'data', data: { topic, payload } };
      expect(receivedObj).toMatchObject(expectedObj);

      client.close();
      mockServer.close();
    });
  });

  describe('listen', () => {
    it('should make listeners to listen messages', async () => {
      const socketId = 'testabc456';
      const mockServer = new MockJsonServer(socketId);
      mockServer.listen((obj: any) => {
        if (obj.type === 'hello') {
          mockServer.sendToConnectedSocket({ type: 'hello-reply' });
        }
      });

      const client = new SocketChannelClient(socketId);
      await client.connect();

      const sendingPayload = { a: 1, b: 'str' };
      const topic = 'test-topic';

      let receivedPayload;
      client.listen(topic, payload => (receivedPayload = payload));

      const data = { topic, payload: sendingPayload };
      mockServer.sendToConnectedSocket({ type: 'data', data });
      await PromiseUtils.delay(0.01);

      expect(receivedPayload).toEqual(sendingPayload);

      client.close();
      mockServer.close();
    });
  });

  describe('unlisten', () => {
    it('should make listeners to unlisten messages', async () => {
      const socketId = 'testsocket';
      const mockServer = new MockJsonServer(socketId);
      mockServer.listen((obj: any) => {
        if (obj.type === 'hello') {
          mockServer.sendToConnectedSocket({ type: 'hello-reply' });
        }
      });

      const client = new SocketChannelClient(socketId);
      await client.connect();

      const sendingPayload = { a: 1, b: { c: 0 } };
      const topic = 'thisistopic';

      let receivedPayload;
      const listener = (payload: any) => (receivedPayload = payload);
      client.listen(topic, listener);
      client.unlisten(topic, listener);

      const data = { topic, payload: sendingPayload };
      mockServer.sendToConnectedSocket({ type: 'data', data });
      await PromiseUtils.delay(0.01);

      expect(receivedPayload).toBeUndefined();

      client.close();
      mockServer.close();
    });
  });
});
