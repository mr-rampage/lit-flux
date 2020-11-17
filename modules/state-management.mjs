import { Provider } from './dependency-resolution-protocol.mjs';

export function StoreProvider(initialState, reducerMap) {
  let state = {...initialState}
  let observers = [];

  function unsubscribe(observer) {
    observers = observers.filter(sub => sub !== observer);
    return observer;
  }

  function publish(state) {
    observers.forEach(observer => observer({ ...state }));
    return state;
  }

  return base => class extends Provider(base) {
    constructor() {
      super();
      this.provideInstance('store', {
        getState() {
          return state;
        },
        dispatch(action) {
          dispatchEvent(action)
        },
        subscribe(observer) {
          observers.push(observer);
          return unsubscribe.bind(null, observer);
        }
      });

      Object
        .keys(reducerMap)
        .forEach(actionType => addEventListener(actionType, e => {
          if (reducerMap[actionType]) {
            const reducer = reducerMap[actionType]
            const action = { type: actionType, ...e.detail };
            state = publish(reducer(state, action));
            this.requestUpdate();
          }
        }));
    }

    get state() {
      return state;
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
