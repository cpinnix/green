import { MONTH_MAP } from "./constants";
import getMonth from "date-fns/getMonth";

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

export function budget(state) {
  return state.budget;
}
