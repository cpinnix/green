import createStore from "bones/createStore";

export default function createInteractor() {
  const store = createStore({});

  return {
    ...store,
    actions: {
      async set(key, state) {
        store.setState({
          ...store.getState(),
          [key]: state,
        });
      },
    },
    selectors: {
      async get(key) {
        return store.getState()[key] || {};
      },
    },
  };
}
