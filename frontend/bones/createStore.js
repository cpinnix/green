import createObservable from "bones/createObservable";

export default function createStore(initialState = null) {
  let state = initialState;
  const observable = createObservable();

  async function setState(newState) {
    state = newState;
    return observable.update(state);
  }

  function getState() {
    return state;
  }

  function subscribe(fn) {
    return observable.subscribe((state) => fn(state));
  }

  function connect(fn) {
    fn(state);
    return observable.subscribe((state) => fn(state));
  }

  return {
    setState,
    getState,
    subscribe,
    connect,
  };
}
