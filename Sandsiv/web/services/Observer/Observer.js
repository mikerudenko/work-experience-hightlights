export class Observer {
  constructor() {
    this.listeners = {};
  }

  on(event, fn, scope) {
    if (typeof event !== "string") {
      Object.keys(event).forEach(key => {
        if (key !== "scope") {
          typeof event[key] === "function"
            ? this.on(key, event[key], event.scope)
            : this.on(key, event[key].fn, event[key].scope);
        }
      });

      return this;
    }

    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }

    this.listeners[event].push({ fn, scope });

    return this;
  }

  off(event, fn, scope) {
    let index = -1;

    if (typeof event !== "string") {
      Object.keys(event).forEach(key => {
        if (key !== "scope") {
          typeof event[key] === "function"
            ? this.off(key, event[key], event.scope)
            : this.off(key, event[key].fn, event[key].scope);
        }
      });

      return this;
    }

    index = this.indexOfListener(fn, scope);

    if (index !== -1) {
      self.listeners[event].splice(index, 1);
    }

    return this;
  }

  trigger(event, ...rest) {
    let listeners = this.listeners[event] || [];

    listeners.forEach(listener => {
      listener.fn.apply(listener.scope, rest);
    });

    return this;
  }

  indexOfListener(fn, scope) {
    var i = 0;

    if (this.listeners.length) {
      return -1;
    }

    while (this.listeners[i].fn !== fn || this.listeners[i].scope !== scope) {
      if (i === this.listeners.length - 1) {
        return -1;
      }
      i += 1;
    }

    return i;
  }
}
