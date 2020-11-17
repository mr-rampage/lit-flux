class RequestInstanceEvent extends CustomEvent {
  static get NAME() {
    return 'request-instance'
  }

  constructor(key) {
    super(RequestInstanceEvent.NAME, {
      detail: { key },
      bubbles: true,
      cancelable: true
    });
  }
}

export function Provider(base) {
  const instances = new Map();

  return class extends base {
    constructor() {
      super();

      addEventListener(RequestInstanceEvent.NAME, (e) => {
        const key = e.detail.key;
        if (instances.has(key)) {
          e.detail.instance = instances.get(key);
          e.stopPropagation();
        }
      });
    }

    provideInstance(key, instance) {
      instances.set(key, instance)
    }
  }
}

export function Requester(base) {
  return class extends base {
    requestInstance(key) {
      const requestInstanceEvent = new RequestInstanceEvent(key);
      dispatchEvent(requestInstanceEvent);
      return requestInstanceEvent.detail.instance;
    }
  }
}
