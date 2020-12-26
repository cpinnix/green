import React, { useEffect } from "react";
import Head from "next/head";
import sum from "lodash/sum";
import { List, AutoSizer } from "react-virtualized";
import Fade from "react-reveal/Fade";
import useInteractors from "hooks/useInteractors";
import createLogger from "utils/createLogger";
import createInteractors from "apps/transactions";
import { MONTH_OPTIONS } from "apps/transactions/constants";
import Navigation from "components/Navigation";
import TransactionRow from "components/TransactionRow";

const log = createLogger("#82B1FF", "[HOME]");

function present(interactors) {
  const { state, actions, selectors } = interactors.transactions;

  log("interactors", interactors);

  const filteredTransactions = selectors.filteredTransactions(state);

  const presentation = {
    state: {
      ...state,
      tagOptions: interactors.transactions.selectors.tagOptions(
        interactors.transactions.state
      ),
      loading: !interactors.transactions.state.initialized,
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

  const {
    state: {
      loading,
      query,
      count,
      net,
      tagOptions,
      selectedTag,
      selectedMonth,
      filteredTransactions,
    },
    actions: { changeQuery, changeTag, changeMonth },
  } = present(interactors);

  const transactions = filteredTransactions;

  function rowRenderer({ index, key, style }) {
    return (
      <div key={key} style={style}>
        <TransactionRow {...transactions[index]} />
      </div>
    );
  }

  return (
    <div className="h-screen">
      <Head>
        <title>Green - Transactions</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex flex-col h-full">
        <Navigation />
        {loading ? null : (
          <Fade>
            <div className="px-8 flex flex-col h-full">
              <div className="flex my-8">
                <input
                  placeholder="search"
                  value={query}
                  onChange={(e) => {
                    changeQuery(e.target.value);
                  }}
                  className="flex-1 mr-4 font-mono text-xs py-2 border-b border-white block bg-transparent text-white focus:outline-none focus:border-blue-500"
                />
                <div className="bg-black border-b border-white font-mono text-xs text-white mr-4 flex items-center focus-within:border-blue-500">
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
                    {tagOptions.map((tag) => (
                      <option key={tag} value={tag}>
                        {tag}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="bg-black border-b border-white font-mono text-xs text-white flex items-center focus-within:border-blue-500">
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
              <div className="font-mono text-xs mb-2 text-white">
                {count} transactions.{" "}
                <span
                  className={`${net < 0 ? "text-red-500" : "text-green-500"}`}
                >
                  {new Intl.NumberFormat("EN-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(net)}
                </span>{" "}
                net.
              </div>
              <div className="flex-1 mb-8">
                <AutoSizer>
                  {({ height, width }) => (
                    <List
                      width={width}
                      height={height}
                      rowCount={transactions.length}
                      rowHeight={32}
                      rowRenderer={rowRenderer}
                      className="border-t border-b border-gray-600 focus:outline-none focus-within:border-blue-500"
                      overscanRowCount={100}
                    />
                  )}
                </AutoSizer>
              </div>
            </div>
          </Fade>
        )}
      </div>
    </div>
  );
}
