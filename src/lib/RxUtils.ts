import Rx = require('rxjs');

import { IChannelClient } from 'types';

export interface IEventEmitter {
  on: Function;
  removeListener: Function;
}

export default class RxUtils {
  public static observableFromEvent(
    emitter: IEventEmitter,
    eventName: string
  ): Rx.Observable<any> {
    return Rx.Observable.create((observer: Rx.Observer<any>) => {
      const listener = (evt: any) => observer.next(evt);
      emitter.on(eventName, listener);
      return () => emitter.removeListener(eventName, listener);
    });
  }

  public static observableFromChannelClient<T extends {}>(
    channel: IChannelClient,
    topic: string
  ): Rx.Observable<T> {
    return Rx.Observable.create((observer: Rx.Observer<any>) => {
      const listener = (payload: {}) => observer.next(payload);
      channel.listen(topic, listener);
      return () => channel.unlisten(topic, listener);
    });
  }
}
