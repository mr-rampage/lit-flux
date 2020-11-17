import { Provider } from './dependency-resolution-protocol.mjs';

export function StoreProvider(initialState, reducerMap) {
  const store = new Store(initialState);
  return base => class extends Provider(base) {
    constructor() {
      super();
      this.provideInstance('store', store);

      Object
        .keys(reducerMap)
        .forEach(actionType => addEventListener(actionType, e => {
          if (reducerMap[actionType]) {
            const reducer = reducerMap[actionType]
            const action = { type: actionType, ...e.detail };
            store.state = reducer(store.state, action);
          }
        }));
    }
  }
}

export function Action(type, payload) {
  return new CustomEvent(type, {
    detail: { payload },
    bubbles: true,
    cancelable: true
  });
}

class Store {
  constructor(initialState) {
    this._state = {...initialState};
    this._observers = [];
  }

  set state(value) {
    this._state = value;
    this._observers.forEach(observer => observer({ ...value }));
  }

  get state() {
    return {...this._state };
  }

  dispatch(action) {
    dispatchEvent(action)
  }

  subscribe(observer) {
    this._observers.push(observer);
    return () => {
      this._observers = this._observers.filter(sub => sub !== observer)
      return observer;
    }
  }
}

