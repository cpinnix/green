import { MONTH_MAP } from "./constants";

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

      return transaction.date.slice(5, 7) === MONTH_MAP[selectedMonth];
    });

  return filteredTransactions;
}
