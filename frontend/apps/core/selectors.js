import { createSelector } from "@reduxjs/toolkit";
import uniq from "lodash/uniq";
import getYear from "date-fns/getYear";
import getMonth from "date-fns/getMonth";
import parseISO from "date-fns/parseISO";
import sumBy from "lodash/sumBy";
import filterTransactions from "./utils/filterTransactions";

export const transactions = (state) => state.transactions;
export const budgets = (state) => state.budgets;
export const loading = (state) => state.loading;

export const tags = createSelector(transactions, (transactions) =>
  uniq(transactions.map((transaction) => transaction.tag))
);

export const years = createSelector(transactions, (transactions) =>
  uniq(transactions.map((transaction) => getYear(parseISO(transaction.date))))
);

export const months = createSelector(transactions, (transactions) =>
  uniq(transactions.map((transaction) => getMonth(parseISO(transaction.date))))
);

export const budget = createSelector(budgets, (budgets) => {
  return budgets.reduce(
    (acc, budget) => ({
      ...acc,
      [budget.tag]: budget.amount,
    }),
    {}
  );
});

export const accounts = (state) => state.accounts;

export const netWorth = createSelector(accounts, (accounts) =>
  sumBy(accounts, ({ amount }) => amount)
);

export const filteredTransactions = createSelector(
  transactions,
  (transactions) => filterTransactions(transactions)
);

export const net = createSelector(
  transactions,
  (transactions) => ({ year, month, tag, query }) => {
    const table = filterTransactions(transactions)({ year, month, tag, query });
    return sumBy(table, (transaction) => transaction.amount);
  }
);
