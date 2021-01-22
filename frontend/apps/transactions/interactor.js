import createStore from "bones/createStore";
import * as actions from "./actions";
import * as selectors from "./selectors";
import createLogger from "utils/createLogger";

const log = createLogger("#B388FF", "[TRANSACTIONS]");

const DEFAULT_STATE = {
  query: "",
  transactions: [],
  budgets: [],
  selectedTag: "",
  selectedMonth: "",
  overrides: {},
  demoMode: {
    enabled: false,
  },
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
    },
    selectors: {
      filteredTransactions: selectors.filteredTransactions,
      transactionsFiltered: selectors.transactionsFiltered,
      net: selectors.net,
      budget: selectors.budget,
      transactions: selectors.transactions,
      tagOptions: selectors.tagOptions,
      tags: selectors.tags,
      months: selectors.months,
      years: selectors.years,
    },
  };
}
