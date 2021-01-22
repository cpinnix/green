import createObservable from "bones/createObservable";
import cloneDeep from "lodash/cloneDeep";

export default function createStore(initialState = null) {
  let state = initialState;
  const observable = createObservable();

  async function setState(newState) {
    state = newState;
    return observable.update(state);
  }

  function getState() {
    return cloneDeep(state);
  }

  function subscribe(fn) {
    return observable.subscribe((state) => fn(cloneDeep(state)));
  }

  function connect(fn) {
    fn(cloneDeep(state));
    return observable.subscribe((state) => fn(cloneDeep(state)));
  }

  return {
    setState,
    getState,
    subscribe,
    connect,
  };
}
