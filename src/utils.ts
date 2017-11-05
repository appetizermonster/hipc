import * as Rx from 'rxjs';

import { IChannel } from './types';

export function observableFromChannel<T>(
  channel: IChannel,
  topic: string
): Rx.Observable<T> {
  return Rx.Observable.create((observer: any) => {
    const handler = (p: T) => observer.next(p);
    channel.listen(topic, handler);
    return () => channel.unlisten(topic, handler);
  });
}
