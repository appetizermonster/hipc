import net from 'net';

import SocketChannelClient from '../../../src/channels/socket/SocketChannelClient';
import SocketUtils from '../../../src/channels/socket/SocketUtils';
import PromiseUtils from '../../utils/PromiseUtils';

describe('SocketChannelClient', () => {
  describe('connect', () => {
    it('should reject if server is not ready', async () => {
      const client = new SocketChannelClient('test');
      await expect(client.connect()).rejects.toBeDefined();
    });

    it('should resolve if server is ready', async () => {
      const socketPath = SocketUtils.getSocketPath('testabc');
      const server = new net.Server();
      server.listen(socketPath);

      const client = new SocketChannelClient('testabc');
      await expect(client.connect()).resolves.toBeUndefined();

      client.close();
      server.close();
    });
  });

  describe('send', () => {
    it("should throw error if it's not connected", () => {
      const client = new SocketChannelClient('testabc');
      const fn = () => client.send('topic', {});
      expect(fn).toThrowError();
    });

    it('should send payload over socket', async () => {
      const socketPath = SocketUtils.getSocketPath('testabc');
      const server = new net.Server();

      let receivedData = null;
      server.listen(socketPath);
      server.on('connection', socket => {
        socket.setEncoding('utf8');
        socket.on('data', d => (receivedData = d));
      });

      const client = new SocketChannelClient('testabc');
      await client.connect();

      const topic = 'mytopic';
      const payload = { a: 1 };
      client.send(topic, payload);
      await PromiseUtils.delay(0.05); // Wait for the sending delay

      const clientDataJson = JSON.stringify({ topic, payload });
      expect(receivedData).toEqual(clientDataJson);

      client.close();
      server.close();
    });
  });
});
