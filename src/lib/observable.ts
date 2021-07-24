type Observer<T> = (message: T) => void;

export default class Observable<T> {
  private observers = [] as Observer<T>[];
  subscribe(observer: Observer<T>) {
    this.observers.push(observer);
  }
  once(observer: Observer<T>) {
    const onceObserver = (message: T) => {
      observer(message);
      this.unsubscribe(onceObserver);
    };
    this.subscribe(onceObserver);
  }
  unsubscribe(observer: Observer<T>){
    this.observers.splice(
      this.observers.indexOf(observer),
      1
    );
  }
  push(message: T) {
    this.observers.forEach(observer => observer(message));
  }
  unsubscribeAll() {
    this.observers = [];
  }
};