import { ILocalChannelServer } from './types';

const runningServers: Map<string, ILocalChannelServer> = new Map();

function addServer(channelName: string, server: ILocalChannelServer): void {
  runningServers.set(channelName, server);
}

function getServer(channelName: string): ILocalChannelServer | null {
  if (!runningServers.has(channelName)) return null;
  return runningServers.get(channelName) as ILocalChannelServer;
}

function isServerRunning(channelName: string): boolean {
  return runningServers.has(channelName);
}

function clearAllServers(): void {
  runningServers.clear();
}

export default {
  addServer,
  getServer,
  isServerRunning,
  clearAllServers
};
