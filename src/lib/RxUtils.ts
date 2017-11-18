import { EventEmitter } from 'events';
import Rx from 'rxjs';

export default class RxUtils {
  public static observableFromEvent(
    emitter: EventEmitter,
    eventName: string
  ): Rx.Observable<any> {
    return Rx.Observable.create((observer: Rx.Observer<any>) => {
      const listener = (evt: any) => observer.next(evt);
      emitter.on(eventName, listener);
      return () => emitter.removeListener(eventName, listener);
    });
  }
}
