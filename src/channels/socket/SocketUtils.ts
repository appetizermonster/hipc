import path from 'path';

export default class SocketUtils {
  public static getSocketPath(identifier: string) {
    const platform = process.platform;
    if (platform === 'win32')
      return SocketUtils.getWindowsSocketPath(identifier);
    return SocketUtils.getUnixSocketPath(identifier);
  }

  public static getWindowsSocketPath(identifier: string) {
    return path.join('\\\\?\\pipe', process.cwd(), identifier);
  }

  public static getUnixSocketPath(identifier: string) {
    return path.join('/tmp', `${identifier}.sock`);
  }
}
