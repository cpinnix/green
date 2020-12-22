import createStore from "bones/createStore";
import * as actions from "./actions";
import * as selectors from "./selectors";

const DEFAULT_STATE = {
  query: "",
  transactions: [],
  filteredTransactions: [],
  tags: [],
  selectedTag: "",
  selectedMonth: "",
  overrides: {},
};

export default function createInteractor({ gateway }) {
  const store = createStore(DEFAULT_STATE);

  const unsubscribe = store.subscribe(function handleStateChange(state) {
    localStorage.setItem("overrides", JSON.stringify(state.overrides));
  });

  return {
    ...store,
    destroy() {
      unsubscribe();
    },
    actions: {
      initiate: actions.initiate({ store, gateway }),
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
