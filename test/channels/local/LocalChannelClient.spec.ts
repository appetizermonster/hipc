import LocalChannelCentral from '../../../src/channels/local/LocalChannelCentral';
import LocalChannelClient from '../../../src/channels/local/LocalChannelClient';
import { ILocalChannelServer } from '../../../src/channels/local/types';

describe('local.ts', () => {
  describe('LocalChannelClient', () => {
    function registerEchoServer(channelName: string) {
      const server: ILocalChannelServer = {
        emit: jest.fn((topic, sender, payload) => sender.send(topic, payload))
      };
      LocalChannelCentral.addServer(channelName, server);
      return server;
    }

    function clearAllServers() {
      LocalChannelCentral.clearAllServers();
    }

    beforeEach(() => clearAllServers());

    describe('connect', () => {
      it('should throw error if server is not ready', async () => {
        const client = new LocalChannelClient('s');
        await expect(client.connect()).rejects.toBeDefined();
      });

      it('should resolve if server is ready', async () => {
        const channelName = 'x';
        registerEchoServer(channelName);

        const client = new LocalChannelClient(channelName);
        await expect(client.connect()).resolves.toBeUndefined();
      });
    });

    describe('send', () => {
      it('should throw error if not connected', () => {
        const client = new LocalChannelClient('x');
        const fn = () => client.send('topic', {});
        expect(fn).toThrowError();
      });

      it('should send payload to the topic in the server', async () => {
        const channelName = 'x';
        const server = registerEchoServer(channelName);

        const client = new LocalChannelClient(channelName);
        const payload = { a: 'test' };
        await client.connect();
        client.send('hello', {});

        expect(server.emit).toBeCalled();
      });
    });

    describe('listen', () => {
      it('should register handler to listen messages for the topic', async () => {
        const channelName = 'x';
        const server = registerEchoServer(channelName);

        const client = new LocalChannelClient(channelName);
        await client.connect();

        const topic = 'topic';
        const handler = jest.fn();
        client.listen(topic, handler);

        client.send(topic, 'hello');
        expect(handler).toBeCalledWith('hello');
      });
    });

    describe('unlisten', () => {
      it('should unregister handler from the topic', async () => {
        const channelName = 'x';

        registerEchoServer(channelName);
        const client = new LocalChannelClient(channelName);

        await client.connect();

        const topic = 'topic';
        const handler = jest.fn();
        client.listen(topic, handler);
        client.unlisten(topic, handler);
        client.send(topic, {});

        expect(handler).not.toBeCalled();
      });
    });
  });
});
