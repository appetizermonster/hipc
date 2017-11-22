import net from 'net';

import SocketChannelServer from '../../../src/channels/socket/SocketChannelServer';
import SocketUtils from '../../../src/channels/socket/SocketUtils';
import JsonSocket from '../../../src/lib/JsonSocket';
import RxUtils from '../../../src/lib/RxUtils';

describe('SocketChannelServer', () => {
  describe('start', () => {
    it('should make ipc pipe', async () => {
      const socketId = 'test';
      const server = new SocketChannelServer(socketId);
      await server.start();

      const socketPath = SocketUtils.getSocketPath(socketId);
      const socket = new net.Socket();
      socket.connect(socketPath);

      const connectionPromise = RxUtils.observableFromEvent(socket, 'connect')
        .take(1)
        .timeout(1000)
        .toPromise();
      await expect(connectionPromise).resolves.toBeUndefined();

      socket.destroy();
      server.close();
    });

    it('should reject if server is already running', async () => {
      const socketId = 'testipc';
      const server = new SocketChannelServer(socketId);
      await server.start();
      await expect(server.start()).rejects.toBeDefined();

      server.close();
    });

    it('should make server to handshake', async () => {
      const socketId = 'testchannel';
      const server = new SocketChannelServer(socketId);
      await server.start();

      const socketPath = SocketUtils.getSocketPath(socketId);
      const jsonSocket = new JsonSocket(new net.Socket());
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

  // describe('listen', () => {
  //   it('should make listeners to listen messages', async () => {
  //     const socketId = 'testnet';
  //     const server = new SocketChannelServer(socketId);
  //     await server.start();

  //     const topic = 'topic';
  //     const sendingPayload = { a: 1 };
  //     let receivedPayload;
  //     server.listen(topic, (sender, payload) => {
  //       receivedPayload = payload;
  //     });

  //     const socketPath = SocketUtils.getSocketPath(socketId);
  //     const socket = new net.Socket();
  //     socket.connect(socketPath);

  //     await RxUtils.observableFromEvent(socket, 'connect')
  //       .take(1)
  //       .timeout(100)
  //       .toPromise();

  //     socket.write('hello');
  //     socket.write(
  //       JSON.stringify({
  //         topic,
  //         payload: sendingPayload
  //       })
  //     );
  //     await PromiseUtils.delay(0.1);

  //     expect(receivedPayload).toMatchObject(sendingPayload);

  //     socket.destroy();
  //     server.close();
  //   });
  // });
});
