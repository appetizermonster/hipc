import path = require('path');

export default class SocketUtils {
  public static getSocketPath(socketId: string) {
    const platform = process.platform;
    if (platform === 'win32') {
      return SocketUtils.getWindowsSocketPath(socketId);
    }
    return SocketUtils.getUnixSocketPath(socketId);
  }

  public static getWindowsSocketPath(socketId: string) {
    return path.join('\\\\?\\pipe', process.cwd(), socketId);
  }

  public static getUnixSocketPath(socketId: string) {
    return path.join('/tmp', `${socketId}.sock`);
  }
}
