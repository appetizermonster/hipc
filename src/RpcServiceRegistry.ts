import { IRpcService, IRpcServiceRegistry } from './types';

export default class RpcServiceRegistry implements IRpcServiceRegistry {
  private services: Map<string, IRpcService>;

  public constructor() {
    this.services = new Map();
  }

  public addService(name: string, service: IRpcService): void {
    this.services.set(name, service);
  }

  public getService(name: string): IRpcService | null {
    const service = this.services.get(name);
    if (!service) return null;
    return service;
  }
}
