import Rx from 'rxjs';

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
}
