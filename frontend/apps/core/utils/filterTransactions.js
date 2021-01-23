import getYear from "date-fns/getYear";
import getMonth from "date-fns/getMonth";
import parseISO from "date-fns/parseISO";

export default function filterTransactions(transactions) {
  return function ({ year, month, tag, query }) {
    let table = transactions;

    if (year !== null && year !== undefined && year !== "") {
      table = table.filter(
        (transaction) => getYear(parseISO(transaction.date)) === year
      );
    }

    if (month !== null && month !== undefined && month !== "") {
      table = table.filter(
        (transaction) => getMonth(parseISO(transaction.date)) === month
      );
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
  };
}
