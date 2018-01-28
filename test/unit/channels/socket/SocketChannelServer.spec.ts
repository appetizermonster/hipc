import net from 'net';

import JsonSocket from 'channels/socket/JsonSocket';
import SocketChannelServer from 'channels/socket/SocketChannelServer';
import SocketUtils from 'channels/socket/SocketUtils';
import PromiseUtils from 'lib/PromiseUtils';
import RxUtils from 'lib/RxUtils';
import { IChannelSender } from 'types';

describe('SocketChannelServer', () => {
  let jsonSocket: JsonSocket | null;
  let server: SocketChannelServer | null;

  afterEach(() => {
    if (jsonSocket) {
      jsonSocket.close();
      jsonSocket = null;
    }
    if (server) {
      server.close();
      server = null;
    }
  });

  describe('#start', () => {
    it('should make ipc pipe', async () => {
      const socketId = 'SocketChannelServer-start-ipcpipe';
      server = new SocketChannelServer(socketId);
      await server.start();

      const socketPath = SocketUtils.getSocketPath(socketId);
      jsonSocket = new JsonSocket(new net.Socket());
      await jsonSocket.connectIpc(socketPath);
    });

    it('should reject if server is already running', async () => {
      const socketId = 'SocketChannelServer-start-reject';
      server = new SocketChannelServer(socketId);
      await server.start();
      await expect(server.start()).rejects.toBeDefined();
    });

    it('should make server to handshake', async () => {
      const socketId = 'SocketChannelServer-start-handshake';
      server = new SocketChannelServer(socketId);
      await server.start();

      const socketPath = SocketUtils.getSocketPath(socketId);
      jsonSocket = new JsonSocket(new net.Socket());
      await jsonSocket.connectIpc(socketPath);
      jsonSocket.send({ type: 'hello' });

      const replyPromise = RxUtils.observableFromEvent(jsonSocket, 'message')
        .take(1)
        .timeout(100)
        .toPromise();

      await expect(replyPromise).resolves.toMatchObject({
        type: 'hello-reply'
      });
    });
  });

  describe('#listen', () => {
    it('should make listeners to listen messages', async () => {
      const socketId = 'SocketChannelServer-listen-listeners';
      server = new SocketChannelServer(socketId);
      await server.start();

      const topic = 'test-topic';
      const sendingPayload = { a: 1 };
      let receivedPayload;
      server.listen(topic, (sender, payload) => (receivedPayload = payload));

      const socketPath = SocketUtils.getSocketPath(socketId);
      jsonSocket = new JsonSocket(new net.Socket());
      await jsonSocket.connectIpc(socketPath);

      const data = { topic, payload: sendingPayload };
      jsonSocket.send({ type: 'hello' });
      jsonSocket.send({ type: 'data', data });
      await PromiseUtils.delay(0.1);

      expect(receivedPayload).toMatchObject(sendingPayload);
    });
  });

  describe('#unlisten', () => {
    it('should make listeners to unlisten messages', async () => {
      const socketId = 'SocketChannelServer-unlisten-listeners';
      server = new SocketChannelServer(socketId);
      await server.start();

      let receivedPayload;
      const topic = 'test-topic';
      const listener = (sender: IChannelSender, payload: {}) =>
        (receivedPayload = payload);
      server.listen(topic, listener);
      server.unlisten(topic, listener);

      const socketPath = SocketUtils.getSocketPath(socketId);
      jsonSocket = new JsonSocket(new net.Socket());
      await jsonSocket.connectIpc(socketPath);

      const data = { topic, payload: {} };
      jsonSocket.send({ type: 'hello' });
      jsonSocket.send({ type: 'data', data });
      await PromiseUtils.delay(0.1);

      expect(receivedPayload).toBeUndefined();
    });
  });
});
