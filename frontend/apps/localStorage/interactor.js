import createStore from "bones/createStore";
import createLogger from "utils/createLogger";

const log = createLogger("#B388FF", "[LOCAL_STORAGE]");

export default function createInteractor() {
  const store = createStore({});

  return {
    ...store,
    actions: {
      async set(key, state) {
        log("set", state);
        store.setState({
          ...store.getState(),
          [key]: state,
        });
        localStorage &&
          state &&
          localStorage.setItem(key, JSON.stringify(state));
      },
    },
    selectors: {
      async get(key) {
        return (
          store.getState()[key] ||
          (localStorage && JSON.parse(localStorage.getItem(key) || "{}"))
        );
      },
    },
  };
}
