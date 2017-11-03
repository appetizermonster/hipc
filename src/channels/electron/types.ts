export interface IElectronChannelSender {
  send(topic: string, payload: {}): void;
}

export interface IElectronChannelObserver {
  on(topic: string, handler: ElectronChannelHandlerFunc): void;
  removeListener(topic: string, handler: ElectronChannelHandlerFunc): void;
}

export type ElectronChannelHandlerFunc = (event: any) => {};
