import uniqBy from "lodash/uniqBy";
import uniq from "lodash/uniq";
import pick from "lodash/pick";
import createLogger from "utils/createLogger";
import createTracer from "utils/createTracer";
import parseISO from "date-fns/parseISO";
import faker from "faker";

const log = createLogger("#B388FF", "[TRANSACTIONS]");
const { createSpan } = createTracer(log);

export function initiate({
  store,
  gateway,
  memoryStorage,
  localStorage,
  unsubscribe,
}) {
  return async function initiate() {
    const endAwaitSpan = createSpan("storage wait in `initiate`");
    const [overrides, demoMode, storedState] = await Promise.all([
      localStorage.selectors.get("transactions.overrides"),
      localStorage.selectors.get("transactions.demo"),
      memoryStorage.selectors.get("transactions.state"),
    ]);
    endAwaitSpan();

    unsubscribe = store.subscribe(function handleStateChange(state) {
      localStorage.actions.set("transactions.overrides", state.overrides);
      memoryStorage.actions.set(
        "transactions.state",
        pick(state, ["transactions", "initialized", "tags", "budget"])
      );
    });

    store.setState({
      ...store.getState(),
      ...storedState,
      overrides,
    });

    if (!storedState.initialized) {
      const endFetchSpan = createSpan("total fetch time in `initiate`");
      const [transactions, taggedExpressions, budgets] = await Promise.all([
        gateway.fetchTransactions(),
        gateway.fetchTaggedExpressions(),
        gateway.fetchBudgets(),
      ]);
      endFetchSpan();

      log("received transactions", transactions);
      log("received tagged expressions", taggedExpressions);
      log("received budgets", budgets);

      const endDecorationSpan = createSpan(
        "transaction decoration in `initiate`"
      );

      let expressions = taggedExpressions
        .map((taggedExpression) => {
          const regex = new RegExp(taggedExpression.regex);

          return {
            ...taggedExpression,
            regex,
          };
        })
        .reverse();

      let decoratedTransactions = transactions
        .map((transaction) => {
          const matchedTaggedExpression = expressions.find(
            ({ regex }) =>
              transaction.description.match(regex) ||
              transaction.hash.match(regex)
          );

          const tag = matchedTaggedExpression?.tag || "untagged";

          return {
            ...transaction,
            tag: tag,
          };
        })
        .filter((transaction) => transaction.tag !== "transfer")
        .map((transaction) => ({
          ...transaction,
          date: parseISO(transaction.date),
          description:
            transaction.description.length > 64
              ? transaction.description.slice(0, 64) + " ..."
              : transaction.description,
        }));

      const preDeduplicationCount = decoratedTransactions.length;

      decoratedTransactions = uniqBy(
        decoratedTransactions,
        (transaction) => transaction.hash
      );

      log(
        `removed ${
          preDeduplicationCount - decoratedTransactions.length
        } duplicates`
      );

      if (demoMode.enabled) {
        decoratedTransactions = decoratedTransactions.map((transaction) => ({
          ...transaction,
          amount: Math.random() * transaction.amount,
          description: faker.lorem.words(
            transaction.description.split(" ").filter((str) => str.length > 3)
              .length
          ),
          hash: faker.helpers.shuffle(transaction.hash.split("")).join(""),
        }));
      }

      endDecorationSpan();

      store.setState({
        ...store.getState(),
        initialized: true,
        transactions: decoratedTransactions,
        budgets,
        demoMode,
      });
    }
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
