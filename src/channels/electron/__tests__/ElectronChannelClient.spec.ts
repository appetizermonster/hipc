import ElectronChannelClient from '../ElectronChannelClient';

describe('ElectronChannelClient', () => {
  describe('connect', () => {
    it('should resolve if server is ready', async () => {
      const observer = {
        on: (topic, handler) => {

        },
        removeListener: (topic, handler) => {

        }
      };
      const sender = {
        send: (topic, payload) => {

        }
      };
      const client = new ElectronChannelClient(observer, sender);
      await client.connect();
    });
  });
});
