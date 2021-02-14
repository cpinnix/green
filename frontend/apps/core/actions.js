import { createAsyncThunk } from "@reduxjs/toolkit";
import * as gateway from "apps/transactions/gateway";

export const fetchData = createAsyncThunk("core/fetchData", async () => {
  let [transactions, taggedExpressions, budgets, accounts] = await Promise.all([
    gateway.fetchTransactions(),
    gateway.fetchTaggedExpressions(),
    gateway.fetchBudgets(),
    gateway.fetchAccounts(),
  ]);
  return {
    transactions,
    taggedExpressions,
    budgets,
    accounts,
  };
});
