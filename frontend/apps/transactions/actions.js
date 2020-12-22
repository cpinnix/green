import uniqBy from "lodash/uniqBy";
import uniq from "lodash/uniq";
import log from "utils/log";

export function initiate({ store, gateway }) {
  return async function initiate() {
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

    const storedOverrides = localStorage.getItem("overrides");

    store.setState({
      ...store.getState(),
      transactions: decoratedTransactions,
      tags,
      ...(storedOverrides || {}),
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
