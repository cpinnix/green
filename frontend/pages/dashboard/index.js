import React from "react";
import Head from "next/head";
import Navigation from "components/Navigation";
import Budget from "components/Budget";
import YearOverYear from "components/YearOverYear";
import TransactionList from "components/TransactionList";
import BudgetTable from "components/BudgetTable";

export default function DashboardPage() {
  return (
    <div>
      <Head>
        <title>Dashboard</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Navigation />
      <div className="px-8 space-y-8 mb-8">
        <div className="grid grid-cols-3 gap-8 items-stretch">
          <div className="col-span-2">
            <YearOverYear height="100%" />
          </div>
          <Budget />
        </div>
        <BudgetTable />
        <TransactionList height={600} />
      </div>
    </div>
  );
}
