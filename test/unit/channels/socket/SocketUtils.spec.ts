import SocketUtils from '../../../../src/channels/socket/SocketUtils';

describe('SocketUtils', () => {
  describe('getSocketPath', () => {
    let oldPlatform: NodeJS.Platform;

    beforeEach(() => {
      oldPlatform = process.platform;
    });

    afterEach(() => {
      process.platform = oldPlatform;
    });

    it('should return type of string', () => {
      const socketPath = SocketUtils.getSocketPath('abc');
      expect(typeof socketPath).toBe('string');
    });

    it('should return proper socket path on Windows', () => {
      process.platform = 'win32';

      const id = 'abcd';
      const socketPath = SocketUtils.getSocketPath(id);
      expect(socketPath).toEqual(SocketUtils.getWindowsSocketPath(id));
    });

    it('should return unix socket path on linux', () => {
      process.platform = 'linux';

      const id = 'abcd';
      const socketPath = SocketUtils.getSocketPath(id);
      expect(socketPath).toEqual(SocketUtils.getUnixSocketPath(id));
    });

    it('should return unix socket path on macOS', () => {
      process.platform = 'darwin';

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
