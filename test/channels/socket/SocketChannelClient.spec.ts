import SocketChannelClient from '../../../src/channels/socket/SocketChannelClient';
import PromiseUtils from '../../utils/PromiseUtils';
import MockServer from './MockServer';

describe('SocketChannelClient', () => {
  describe('connect', () => {
    it('should reject if server is not ready', async () => {
      const client = new SocketChannelClient('test');
      await expect(client.connect()).rejects.toBeDefined();
    });

    it('should resolve if server is ready', async () => {
      const socketId = 'testabc';
      const mockServer = new MockServer(socketId);
      mockServer.listen();

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
      const socketId = 'testabc';
      const mockServer = new MockServer(socketId);

      let receivedData;
      mockServer.listen();
      mockServer.listenSocketDataEvent(d => (receivedData = d));

      const client = new SocketChannelClient(socketId);
      await client.connect();

      const topic = 'mytopic';
      const payload = { a: 1 };
      client.send(topic, payload);
      await PromiseUtils.delay(0.05); // Wait for the sending delay

      const clientDataJson = JSON.stringify({ topic, payload });
      expect(receivedData).toEqual(clientDataJson);

      client.close();
      mockServer.close();
    });
  });

  describe('listen', () => {
    it('should make listeners to listen messages', async () => {
      const socketId = 'testabc';
      const mockServer = new MockServer(socketId);
      mockServer.listen();

      const client = new SocketChannelClient(socketId);
      await client.connect();
      await PromiseUtils.delay(0.01); // HACK

      const sendingPayload = { a: 1, b: 'str' };
      const topic = 'thisistopic';

      let receivedPayload;
      client.listen(topic, payload => (receivedPayload = payload));

      mockServer.sendJsonToConnectedSocket({ topic, payload: sendingPayload });
      await PromiseUtils.delay(0.01);

      expect(receivedPayload).toEqual(sendingPayload);

      client.close();
      mockServer.close();
    });
  });

  describe('unlisten', () => {
    it('should make listeners to unlisten messages', async () => {
      const socketId = 'testsocket';
      const mockServer = new MockServer(socketId);
      mockServer.listen();

      const client = new SocketChannelClient(socketId);
      await client.connect();
      await PromiseUtils.delay(0.01); // HACK

      const sendingPayload = { a: 1, b: { c: 0 } };
      const topic = 'thisistopic';

      let receivedPayload;
      const listener = (payload: any) => (receivedPayload = payload);
      client.listen(topic, listener);
      client.unlisten(topic, listener);

      mockServer.sendJsonToConnectedSocket({ topic, payload: sendingPayload });
      await PromiseUtils.delay(0.01);

      expect(receivedPayload).toBeUndefined();

      client.close();
      mockServer.close();
    });
  });
});
