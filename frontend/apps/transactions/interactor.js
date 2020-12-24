import createStore from "bones/createStore";
import * as actions from "./actions";
import * as selectors from "./selectors";
import createLogger from "utils/createLogger";
import createTracer from "utils/createTracer";

const log = createLogger("#B388FF", "[TRANSACTIONS]");
const { createSpan } = createTracer(log);

const DEFAULT_STATE = {
  query: "",
  transactions: [],
  filteredTransactions: [],
  tags: [],
  selectedTag: "",
  selectedMonth: "",
  overrides: {},
};

export default function createInteractor({
  gateway,
  localStorage,
  memoryStorage,
}) {
  const store = createStore(DEFAULT_STATE);

  let unsubscribe;

  return {
    ...store,
    destroy() {
      unsubscribe?.();
      log("destroyed");
    },
    actions: {
      initiate: actions.initiate({
        store,
        gateway,
        localStorage,
        memoryStorage,
        unsubscribe,
      }),
      changeQuery: actions.changeQuery({ store }),
      changeTag: actions.changeTag({ store }),
      changeMonth: actions.changeMonth({ store }),
      changeDescription: actions.changeDescription({ store }),
    },
    selectors: {
      filteredTransactions: selectors.filteredTransactions,
    },
  };
}
