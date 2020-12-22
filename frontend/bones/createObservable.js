export default function createObservable() {
  let callbacks = [];

  async function update(...args) {
    return Promise.all(callbacks.map((callback) => callback(...args)));
  }

  function subscribe(fn) {
    callbacks.push(fn);

    return function () {
      callbacks = callbacks.filter((val) => val !== fn);
    };
  }

  return {
    update,
    subscribe,
  };
}
