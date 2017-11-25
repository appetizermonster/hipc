import { IIpcService, IIpcServiceRegistry } from './types';

export default class IpcServiceRegistry implements IIpcServiceRegistry {
  private services: Map<string, IIpcService>;

  public constructor() {
    this.services = new Map();
  }

  public addService(name: string, service: IIpcService): void {
    this.services.set(name, service);
  }

  public getService(name: string): IIpcService | null {
    const service = this.services.get(name);
    if (!service) return null;
    return service;
  }
}
