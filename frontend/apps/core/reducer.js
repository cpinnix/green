import uniqBy from "lodash/uniqBy";
import { createReducer } from "@reduxjs/toolkit";
import { fetchData } from "./actions";

const initialState = {
  transactions: [],
  budgets: [],
  loading: true,
};

export default createReducer(initialState, (builder) => {
  builder.addCase(fetchData.fulfilled, (state, action) => {
    const { transactions, taggedExpressions, budgets } = action.payload;

    state.budgets = budgets;

    let expressions = taggedExpressions
      .map((taggedExpression) => {
        const regex = new RegExp(taggedExpression.regex);

        return {
          ...taggedExpression,
          regex,
        };
      })
      .reverse();

    state.transactions = transactions
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
        date: transaction.date,
        description:
          transaction.description.length > 64
            ? transaction.description.slice(0, 64) + " ..."
            : transaction.description,
      }));

    const preDeduplicationCount = state.transactions.length;

    state.transactions = uniqBy(
      state.transactions,
      (transaction) => transaction.hash
    );

    state.duplicateCount = preDeduplicationCount - state.transactions.length;

    state.loading = false;
  });
});
