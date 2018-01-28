import SocketChannelClient from 'channels/socket/SocketChannelClient';
import PromiseUtils from 'lib/PromiseUtils';
import MockJsonServer from '../../../helpers/MockJsonServer';

describe('SocketChannelClient', () => {
  let client: SocketChannelClient | null;
  let mockServer: MockJsonServer | null;

  afterEach(() => {
    if (client) {
      client.close();
      client = null;
    }
    if (mockServer) {
      mockServer.close();
      mockServer = null;
    }
  });

  describe('connect', () => {
    it('should reject if server is not ready', async () => {
      client = new SocketChannelClient('SocketChannelClient-connect-notready');
      await expect(client.connect()).rejects.toBeDefined();
    });

    it('should resolve if server is ready', async () => {
      const socketId = 'SocketChannelClient-connect-ready';
      mockServer = new MockJsonServer(socketId);
      mockServer.listen((obj: any) => {
        if (obj.type === 'hello') {
          mockServer!.sendToConnectedSocket({ type: 'hello-reply' });
        }
      });

      client = new SocketChannelClient(socketId);
      await expect(client.connect()).resolves.toBeUndefined();
    });
  });

  describe('send', () => {
    it("should throw error if it's not connected", () => {
      client = new SocketChannelClient(
        'SocketChannelClient-send-not-connected'
      );
      const fn = () => client!.send('topic', {});
      expect(fn).toThrowError();
    });

    it('should send payload over socket', async () => {
      const socketId = 'SocketChannelClient-send-payload';
      mockServer = new MockJsonServer(socketId);

      let receivedObj;
      mockServer.listen(obj => {
        if (obj.type === 'hello') {
          mockServer!.sendToConnectedSocket({ type: 'hello-reply' });
        } else {
          receivedObj = obj;
        }
      });

      client = new SocketChannelClient(socketId);
      await client.connect();

      const topic = 'mytopic';
      const payload = { a: 1 };
      client.send(topic, payload);
      await PromiseUtils.delay(0.01); // Wait for the sending delay

      const expectedObj = { type: 'data', data: { topic, payload } };
      expect(receivedObj).toMatchObject(expectedObj);
    });
  });

  describe('listen', () => {
    it('should make listeners to listen messages', async () => {
      const socketId = 'SocketChannelClient-listen-listeners';
      mockServer = new MockJsonServer(socketId);
      mockServer.listen((obj: any) => {
        if (obj.type === 'hello') {
          mockServer!.sendToConnectedSocket({ type: 'hello-reply' });
        }
      });

      client = new SocketChannelClient(socketId);
      await client.connect();

      const sendingPayload = { a: 1, b: 'str' };
      const topic = 'test-topic';

      let receivedPayload;
      client.listen(topic, payload => (receivedPayload = payload));

      const data = { topic, payload: sendingPayload };
      mockServer.sendToConnectedSocket({ type: 'data', data });
      await PromiseUtils.delay(0.01);

      expect(receivedPayload).toEqual(sendingPayload);
    });
  });

  describe('unlisten', () => {
    it('should make listeners to unlisten messages', async () => {
      const socketId = 'SocketChannelClient-unlisten-listeners';
      mockServer = new MockJsonServer(socketId);
      mockServer.listen((obj: any) => {
        if (obj.type === 'hello') {
          mockServer!.sendToConnectedSocket({ type: 'hello-reply' });
        }
      });

      client = new SocketChannelClient(socketId);
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
    });
  });
});
