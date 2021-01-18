import { MONTH_MAP } from "./constants";
import getMonth from "date-fns/getMonth";
import getYear from "date-fns/getYear";
import uniq from "lodash/uniq";
import sumBy from "lodash/sumBy";
import createLogger from "utils/createLogger";
import createTracer from "utils/createTracer";

const log = createLogger("#B388FF", "[TRANSACTIONS]");
const { createSpan } = createTracer(log);

export function transactions(state) {
  return state.transactions;
}

export function filteredTransactions(state) {
  const { query, transactions, selectedTag, selectedMonth, overrides } = state;

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
      return getMonth(transaction.date) == MONTH_MAP[selectedMonth];
    });

  return filteredTransactions;
}

export function transactionsFiltered(state, { year, month, tag, query }) {
  let table = transactions(state);

  if (year !== null && year !== undefined && year !== "") {
    table = table.filter((transaction) => getYear(transaction.date) === year);
  }

  if (month !== null && month !== undefined && month !== "") {
    table = table.filter((transaction) => getMonth(transaction.date) === month);
  }

  if (tag !== null && tag !== undefined && tag !== "") {
    table = table.filter((transaction) => transaction.tag === tag);
  }

  if (query !== null && query !== undefined && query !== "") {
    table = table.filter((transaction) => {
      const description = transaction.description;
      return description.toLowerCase().includes(query.toLowerCase());
    });
  }

  return table;
}

export function net(state, { year, month, tag, query }) {
  // const endSpan = createSpan("`net`");

  let table = transactionsFiltered(state, { year, month, tag, query });

  const net = sumBy(table, (transaction) => transaction.amount);

  // endSpan();

  return net;
}

export function budget(state) {
  const endSpan = createSpan("`budget`");

  let budget = state.budgets.reduce(
    (acc, budget) => ({
      ...acc,
      [budget.tag]: budget.amount,
    }),
    {}
  );

  if (state.demoMode.enabled) {
    budget = Object.keys(budget).reduce(
      (acc, key) => ({
        ...acc,
        [key]: Math.random() * budget[key],
      }),
      {}
    );
  }

  endSpan();

  return budget;
}

export function tagOptions(state) {
  const endSpan = createSpan("`tagOptions`");
  const tagOptions = uniq(
    state.transactions.map((transaction) => transaction.tag)
  ).filter((tag) => tag);
  endSpan();
  return tagOptions;
}

export function tags(state) {
  const endSpan = createSpan("`tags`");
  const tags = uniq(state.transactions.map((transaction) => transaction.tag));
  endSpan();
  return tags;
}

export function years(state) {
  const endSpan = createSpan("`years`");
  const years = uniq(
    state.transactions.map((transaction) => getYear(transaction.date))
  );
  endSpan();
  return years;
}

export function months(state) {
  const endSpan = createSpan("`months`");
  const months = uniq(
    state.transactions.map((transaction) => getMonth(transaction.date))
  );
  endSpan();
  return months;
}
