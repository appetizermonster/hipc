import { ILocalChannelServer } from './types';

const runningServers: Map<string, ILocalChannelServer> = new Map();

export default class LocalChannelCentral {
  public static addServer(
    channelName: string,
    server: ILocalChannelServer
  ): void {
    runningServers.set(channelName, server);
  }

  public static getServer(channelName: string): ILocalChannelServer | null {
    if (!runningServers.has(channelName)) return null;
    return runningServers.get(channelName) as ILocalChannelServer;
  }

  public static isServerRunning(channelName: string): boolean {
    return runningServers.has(channelName);
  }

  public static clearAllServers(): void {
    runningServers.clear();
  }
}
