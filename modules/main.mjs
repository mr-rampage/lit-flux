import { LitElement, html } from '//unpkg.com/@polymer/lit-element@latest/lit-element.js?module';
import { Provider, Requester } from './dependency-resolution-protocol.mjs';
import { StoreProvider, Action } from './state-management.mjs';

class MyProvider extends Provider(LitElement) {
  constructor() {
    super();
    this.provideInstance('logger', console);
  }

  render() {
    return html`<p><slot></slot></p>`;
  }
}

customElements.define('my-provider', MyProvider);

class MyRequester extends Requester(LitElement) {
  connectedCallback() {
    super.connectedCallback();
    let logger = this.requestInstance('logger');
    logger.info('Logging using dependency injection!');
  }

  render() {
    return html`You should see something in the console!`;
  }
}

customElements.define('my-requester', MyRequester);

class CountStoreProvider extends StoreProvider({count: 0}, {
  'increment': (state, action) => ({count: state.count + 1}),
  'decrement': (state, action) => ({count: state.count - 1})
})(LitElement) {
  render() {
    return html`<slot></slot>`;
  }
}

customElements.define('count-provider', CountStoreProvider);

class Counter extends Requester(LitElement) {

  constructor() {
    super();
    this.count = 0;
  }

  connectedCallback() {
    super.connectedCallback();
    const store = this.requestInstance('store');
    this.disconnect = store.subscribe(state => {
      this.count = state.count;
      this.requestUpdate();
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.disconnect();
  }

  render() {
    return html`<p>Count is: ${this.count}</p>`
  }
}

customElements.define('count-counter', Counter);

class CountButtons extends Requester(LitElement) {
  connectedCallback() {
    super.connectedCallback();
    const store = this.requestInstance('store');
    this.dispatch = store.dispatch;
  }

  increment(e) {
    this.dispatch(Action('increment'));
  }

  decrement(e) {
    this.dispatch(Action('decrement'));
  }

  render() {
    return html`
        <div>
          <button @click="${this.increment}">Increment</button>
          <button @click="${this.decrement}">Decrement</button>
        </div>
    `
  }
}

customElements.define('count-buttons', CountButtons);
