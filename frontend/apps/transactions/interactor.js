import uniqBy from "lodash/uniqBy";
import uniq from "lodash/uniq";
import createStore from "bones/createStore";
import log from "utils/log";

import { MONTH_MAP } from "./constants";

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
      async initiate() {
        let response = await gateway.fetchTransactions();

        log("received transactions", response);

        const transactions = uniqBy(
          response.data.transactions,
          (transaction) => transaction.hash
        )
          .filter((transaction) => transaction.tag !== "transfer")
          .map((transaction) => ({
            ...transaction,
            description:
              transaction.description.length > 64
                ? transaction.description.slice(0, 64) + " ..."
                : transaction.description,
          }));

        const tags = [
          "",
          ...uniq(transactions.map((transaction) => transaction.tag)).filter(
            (tag) => tag
          ),
        ];

        const storedOverrides = localStorage.getItem("overrides");

        store.setState({
          ...store.getState(),
          transactions,
          tags,
          ...(storedOverrides || {}),
        });
      },
      changeQuery(query) {
        store.setState({
          ...store.getState(),
          query,
        });
      },
      changeTag(tag) {
        store.setState({
          ...store.getState(),
          selectedTag: tag,
        });
      },
      changeMonth(month) {
        store.setState({
          ...store.getState(),
          selectedMonth: month,
        });
      },
      changeDescription(hash, description) {
        log("change", hash, description);
        store.setState({
          ...store.getState(),
          overrides: {
            ...store.getState().overrides,
            [hash]: description,
          },
        });
      },
    },
    selectors: {
      filteredTransactions(state) {
        const {
          query,
          transactions,
          selectedTag,
          selectedMonth,
          overrides,
        } = state;

        if (!selectedTag && !selectedMonth && !query) return transactions;

        const filteredTransactions = transactions
          .filter((transaction) => {
            if (query.length === 0) return true;

            const description =
              overrides[transaction.hash] || transaction.description;
            return description.toLowerCase().includes(query.toLowerCase());
          })
          .filter((transaction) => {
            if (selectedTag.length === 0) return true;

            return transaction.tag === selectedTag;
          })
          .filter((transaction) => {
            if (selectedMonth.length === 0) return true;

            return transaction.date.slice(5, 7) === MONTH_MAP[selectedMonth];
          });

        return filteredTransactions;
      },
    },
  };
}
