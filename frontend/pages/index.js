import React, { useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import sum from "lodash/sum";
import { format } from "date-fns";
import { List, AutoSizer } from "react-virtualized";
import useInteractors from "hooks/useInteractors";
import createLogger from "utils/createLogger";
import createInteractors from "apps/transactions";
import { MONTH_OPTIONS } from "apps/transactions/constants";
import classes from "./index.module.css";

const log = createLogger("#82B1FF", "[HOME]");

function present(interactors) {
  const { state, actions, selectors } = interactors.transactions;

  log("interactors", interactors);

  const filteredTransactions = selectors.filteredTransactions(state);

  const presentation = {
    state: {
      ...state,
      filteredTransactions,
      count: filteredTransactions.length,
      net: sum(filteredTransactions.map((transaction) => transaction.amount)),
    },
    actions,
  };

  log("presentation", presentation);

  return presentation;
}

export default function Page() {
  const interactors = useInteractors(() => createInteractors());

  useEffect(() => {
    interactors.transactions.actions.initiate();
  }, []);

  const presentation = present(interactors);
  const {
    state: {
      query,
      count,
      net,
      tags,
      selectedTag,
      selectedMonth,
      filteredTransactions,
      overrides,
    },
    actions: { changeQuery, changeTag, changeMonth, changeDescription },
  } = presentation;

  const transactions = filteredTransactions;

  function rowRenderer({ index, key, style }) {
    const transaction = transactions[index];

    const content = (
      <div className={classes.row}>
        <div className="font-mono text-xs text-white">{index}</div>
        <div className="font-mono text-xs text-white">{transaction.hash}</div>
        <div className="font-mono text-xs text-white">
          {format(new Date(transaction.date), "MMM dd yyyy")}
        </div>
        <div
          className={`font-mono text-xs text-white ${
            transaction.amount < 0 ? "text-red-500" : "text-green-500"
          }`}
        >
          {transaction.amount}
        </div>
        <div className="font-mono text-xs text-white">{transaction.tag}</div>
        <input
          value={overrides[transaction.hash] || transaction.description}
          className="font-mono text-xs text-white bg-transparent focus:outline-none"
          onChange={(e) => {
            changeDescription(transaction.hash, e.target.value);
          }}
        />
      </div>
    );

    return (
      <div key={key} style={style}>
        {content}
      </div>
    );
  }

  return (
    <div className="h-screen">
      <Head>
        <title>Green</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Link href="/trends">
        <a className="text-white">Trends</a>
      </Link>
      <div className="container mx-auto px-8 flex flex-col h-full">
        <div className="flex mt-16 mb-8">
          <input
            placeholder="search"
            value={query}
            onChange={(e) => {
              changeQuery(e.target.value);
            }}
            className="flex-1 mr-4 font-mono text-xs p-3 border rounded border-white block bg-transparent text-white focus:outline-none focus:border-blue-500"
          />
          <div className="bg-black border rounded border-white font-mono text-xs text-white mr-4 flex items-center pl-3 focus-within:border-blue-500">
            <div className="font-mono text-xs text-white">tag:</div>
            <select
              name="cars"
              id="cars"
              value={selectedTag}
              className="pr-3 bg-transparent appearance-none focus:outline-none"
              onChange={(e) => {
                changeTag(e.target.value);
              }}
            >
              {tags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          </div>
          <div className="bg-black border rounded border-white font-mono text-xs text-white mr-4 flex items-center pl-3 focus-within:border-blue-500">
            <div className="font-mono text-xs text-white">month:</div>
            <select
              name="month"
              id="month"
              value={selectedMonth}
              className="pr-3 bg-transparent appearance-none focus:outline-none"
              onChange={(e) => {
                changeMonth(e.target.value);
              }}
            >
              {MONTH_OPTIONS.map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="font-mono text-xs mb-8 text-white">
          {count} transactions.{" "}
          <span className={`${net < 0 ? "text-red-500" : "text-green-500"}`}>
            {new Intl.NumberFormat("EN-US", {
              style: "currency",
              currency: "USD",
            }).format(net)}
          </span>{" "}
          net.
        </div>
        <div className="flex-1 mb-16">
          <AutoSizer>
            {({ height, width }) => (
              <List
                width={width}
                height={height}
                rowCount={transactions.length}
                rowHeight={32}
                rowRenderer={rowRenderer}
                className="border border-white rounded focus:outline-none focus-within:border-blue-500"
                overscanRowCount={100}
              />
            )}
          </AutoSizer>
        </div>
      </div>
    </div>
  );
}
