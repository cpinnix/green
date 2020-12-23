import uniqBy from "lodash/uniqBy";
import uniq from "lodash/uniq";
import createLogger from "utils/createLogger";

const log = createLogger("#B388FF", "[TRANSACTIONS]");

export function initiate({
  store,
  gateway,
  memoryStorage,
  localStorage,
  unsubscribe,
}) {
  return async function initiate() {
    const [overrides, storedState] = await Promise.all([
      localStorage.selectors.get("transactions.overrides"),
      memoryStorage.selectors.get("transactions.state"),
    ]);

    unsubscribe = store.subscribe(function handleStateChange(state) {
      localStorage.actions.set("transactions.overrides", state.overrides);
      memoryStorage.actions.set("transactions.state", state);
    });

    store.setState({
      ...store.getState(),
      ...storedState,
      overrides,
    });

    const [transactions, taggedExpressions] = await Promise.all([
      gateway.fetchTransactions(),
      gateway.fetchTaggedExpressions(),
    ]);

    log("received transactions", transactions);
    log("received tagged expressions", taggedExpressions);

    const decoratedTransactions = uniqBy(
      transactions,
      (transaction) => transaction.hash
    )
      .map((transaction) => {
        const tag = taggedExpressions
          .filter(({ regex }) => {
            const regExp = new RegExp(regex);
            return (
              transaction.description.match(regExp) ||
              regex === transaction.hash
            );
          })
          .map(({ tag }) => tag)
          .reduce((_, tag) => tag, "");

        return {
          ...transaction,
          description:
            transaction.description.length > 64
              ? transaction.description.slice(0, 64) + " ..."
              : transaction.description,
          tag,
        };
      })
      .filter((transaction) => transaction.tag !== "transfer");

    const tags = [
      "",
      ...uniq(
        decoratedTransactions.map((transaction) => transaction.tag)
      ).filter((tag) => tag),
    ];

    // const storedOverrides = localStorage.getItem("overrides");

    store.setState({
      ...store.getState(),
      transactions: decoratedTransactions,
      tags,
      // ...(storedOverrides || {}),
    });
  };
}

export function changeQuery({ store }) {
  return function (query) {
    store.setState({
      ...store.getState(),
      query,
    });
  };
}

export function changeTag({ store }) {
  return function (tag) {
    store.setState({
      ...store.getState(),
      selectedTag: tag,
    });
  };
}

export function changeMonth({ store }) {
  return function (month) {
    store.setState({
      ...store.getState(),
      selectedMonth: month,
    });
  };
}

export function changeDescription({ store }) {
  return function (hash, description) {
    log("change", hash, description);
    store.setState({
      ...store.getState(),
      overrides: {
        ...store.getState().overrides,
        [hash]: description,
      },
    });
  };
}
