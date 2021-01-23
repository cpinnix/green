import { createAsyncThunk } from "@reduxjs/toolkit";
import * as gateway from "apps/transactions/gateway";

export const fetchData = createAsyncThunk("core/fetchData", async () => {
  let [transactions, taggedExpressions, budgets] = await Promise.all([
    gateway.fetchTransactions(),
    gateway.fetchTaggedExpressions(),
    gateway.fetchBudgets(),
  ]);
  return {
    transactions,
    taggedExpressions,
    budgets,
  };
});
