import LocalChannelServer from 'channels/local/LocalChannelServer';
import { IChannelSender } from 'types';

describe('LocalChannelServer', () => {
  function createSender(): IChannelSender {
    return {
      send: jest.fn()
    };
  }

  describe('#start', () => {
    it('should throw error if already started', async () => {
      const server = new LocalChannelServer('x');
      await server.start();
      await expect(server.start()).rejects.toBeDefined();
    });

    it('should register it to central', async () => {
      const server = new LocalChannelServer('x');
      await server.start();
    });
  });

  describe('#listen', () => {
    it('should register handler to listen messages for the topic', async () => {
      const server = new LocalChannelServer('x');
      await server.start();

      const topic = 'topic';
      const payload = {};
      const handler = jest.fn();
      server.listen(topic, handler);

      const sender = createSender();
      server.emit(topic, sender, payload);

      expect(handler).toBeCalledWith(sender, payload);
    });
  });

  describe('#unlisten', () => {
    it('should unregister handler to listen messages for the topic', async () => {
      const server = new LocalChannelServer('x');
      await server.start();

      const topic = 'topic';
      const handler = jest.fn();
      server.listen(topic, handler);
      server.unlisten(topic, handler);

      const sender = createSender();
      server.emit(topic, sender, {});

      expect(handler).not.toBeCalled();
    });
  });
});
