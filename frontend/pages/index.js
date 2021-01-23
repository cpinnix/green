import React, { useEffect } from "react";
import Head from "next/head";
import Navigation from "components/Navigation";
import core from "apps/core";
import * as actions from "apps/core/actions";
import TransactionList from "components/TransactionList";

export default function Page() {
  useEffect(() => {
    core.dispatch(actions.fetchData());
  }, []);

  return (
    <div className="h-screen flex flex-col">
      <Head>
        <title>Transactions</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Navigation />
      <TransactionList height="100%" />
    </div>
  );
}
