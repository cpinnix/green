import uniqBy from "lodash/uniqBy";
import pick from "lodash/pick";
import createLogger from "utils/createLogger";
import createTracer from "utils/createTracer";
import parseISO from "date-fns/parseISO";

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
    const [overrides, storedState] = await Promise.all([
      localStorage.selectors.get("transactions.overrides"),
      memoryStorage.selectors.get("transactions.state"),
    ]);
    endAwaitSpan();

    unsubscribe = store.subscribe(function handleStateChange(state) {
      localStorage.actions.set("transactions.overrides", state.overrides);
      memoryStorage.actions.set(
        "transactions.state",
        pick(state, ["transactions", "initialized", "budgets"])
      );
    });

    store.setState({
      ...store.getState(),
      ...storedState,
      overrides,
    });

    if (!storedState.initialized) {
      const endFetchSpan = createSpan("total fetch time in `initiate`");
      let [transactions, taggedExpressions, budgets] = await Promise.all([
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

      endDecorationSpan();

      store.setState({
        ...store.getState(),
        initialized: true,
        transactions: decoratedTransactions,
        budgets,
      });
    }
  };
}
