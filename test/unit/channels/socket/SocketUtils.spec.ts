import SocketUtils from 'channels/socket/SocketUtils';

describe('SocketUtils', () => {
  describe('getSocketPath', () => {
    let oldPlatform: NodeJS.Platform;

    beforeEach(() => {
      oldPlatform = process.platform;
    });

    function setProcessPlatform(platform: NodeJS.Platform) {
      Object.defineProperty(process, 'platform', { value: platform });
    }

    afterEach(() => setProcessPlatform(oldPlatform));

    it('should return type of string', () => {
      const socketPath = SocketUtils.getSocketPath('abc');
      expect(typeof socketPath).toBe('string');
    });

    it('should return proper socket path on Windows', () => {
      setProcessPlatform('win32');

      const id = 'abcd';
      const socketPath = SocketUtils.getSocketPath(id);
      expect(socketPath).toEqual(SocketUtils.getWindowsSocketPath(id));
    });

    it('should return unix socket path on linux', () => {
      setProcessPlatform('linux');

      const id = 'abcd';
      const socketPath = SocketUtils.getSocketPath(id);
      expect(socketPath).toEqual(SocketUtils.getUnixSocketPath(id));
    });

    it('should return unix socket path on macOS', () => {
      setProcessPlatform('darwin');

      const id = 'abcd';
      const socketPath = SocketUtils.getSocketPath(id);
      expect(socketPath).toEqual(SocketUtils.getUnixSocketPath(id));
    });
  });

  describe('getWindowsSocketPath', () => {
    it('should return type of string', () => {
      const socketPath = SocketUtils.getWindowsSocketPath('foripc');
      expect(typeof socketPath).toBe('string');
    });

    it('should starts with \\\\?\\pipe', () => {
      const socketPath = SocketUtils.getWindowsSocketPath('windowssocket');
      expect(socketPath.startsWith('\\\\?\\pipe')).toBeTruthy();
    });
  });

  describe('getUnixSocketPath', () => {
    it('should return type of string', () => {
      const socketPath = SocketUtils.getUnixSocketPath('thisissocket');
      expect(typeof socketPath).toBe('string');
    });

    it('should ends with .sock', () => {
      const socketPath = SocketUtils.getUnixSocketPath('temporarysocket');
      expect(socketPath.endsWith('.sock')).toBeTruthy();
    });
  });
});
