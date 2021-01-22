import React, { useEffect, useState } from "react";
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
import formatCurrency from "utils/formatCurrency";

const log = createLogger("#82B1FF", "[HOME]");

function present(interactors) {
  const { state, actions } = interactors.transactions;

  log("interactors", interactors);

  const presentation = {
    state: {
      ...state,
      tagOptions: interactors.transactions.selectors.tagOptions(
        interactors.transactions.state
      ),
      loading: !interactors.transactions.state.initialized,
      years: interactors.transactions.selectors.years(
        interactors.transactions.state
      ),
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

  const [year, changeYear] = useState("");

  const {
    state: { loading, query, tagOptions, selectedTag, selectedMonth, years },
    actions: { changeQuery, changeTag, changeMonth },
  } = present(interactors);

  const transactions = interactors.transactions.selectors.transactionsFiltered(
    interactors.transactions.state,
    {
      year,
      month: selectedMonth,
      tag: selectedTag,
      query,
    }
  );

  log("transactions", { transactions, year, selectedMonth, selectedTag });

  const count = transactions.length;
  const net = sum(transactions.map((transaction) => transaction.amount));

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
        <title>Transactions</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex flex-col h-full">
        <Navigation />
        {loading ? null : (
          <Fade>
            <div className="px-8 h-full">
              <div className="flex flex-col h-full bg-grey-900">
              <div className="flex items-center space-x-2">
                  <div className="font-mono text-xs text-white flex items-center focus-within:border-blue-500 leading-none">
                  <select
                    name="tags"
                    id="tags"
                    value={selectedTag}
                    className="p-3 bg-transparent appearance-none focus:outline-none cursor-pointer"
                    onChange={(e) => {
                      changeTag(e.target.value);
                    }}
                  >
                    <option value="">select tag</option>
                    {tagOptions.map((tag) => (
                      <option key={tag} value={tag}>
                        {tag}
                      </option>
                    ))}
                  </select>
                </div>
                  <div className="font-mono text-xs text-white flex items-center focus-within:border-blue-500 leading-none">
                  <select
                    name="year"
                    id="year"
                    value={year}
                    className="p-3 bg-transparent appearance-none focus:outline-none cursor-pointer"
                    onChange={(e) => {
                      let newYear = e.target.value;
                      if (newYear) {
                        newYear = parseInt(newYear);
                      }
                      changeYear(newYear);
                    }}
                  >
                    <option value="">select year</option>
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
                  <div className="font-mono text-xs text-white flex items-center focus-within:border-blue-500 leading-none">
                  <select
                    name="month"
                    id="month"
                    value={selectedMonth}
                    className="p-3 bg-transparent appearance-none focus:outline-none cursor-pointer"
                    onChange={(e) => {
                      let newMonth = e.target.value;
                      if (newMonth) {
                        newMonth = parseInt(newMonth);
                      }
                      changeMonth(newMonth);
                    }}
                  >
                    <option value="">select month</option>
                    {MONTH_OPTIONS.map((month, index) => (
                      <option key={month} value={index}>
                        {month}
                      </option>
                    ))}
                  </select>
                </div>
                <input
                  placeholder="search"
                  value={query}
                  onChange={(e) => {
                    changeQuery(e.target.value);
                  }}
                    className="flex-1 font-mono text-xs leading-none p-3 bg-transparent text-white focus:outline-none focus:text-blue-500 w-24"
                />
                <div className="font-mono text-xs mb-0.5 text-white pr-2">
                  <span
                    className={`whitespace-pre ${
                      net < 0 ? "text-red-500" : "text-green-500"
                    }`}
                  >
                    {formatCurrency(net)}
                  </span>{" "}
                  net. {count} transactions.
                </div>
              </div>

              <div className="flex-1">
                <AutoSizer>
                  {({ height, width }) => (
                    <List
                      width={width}
                      height={height}
                      rowCount={transactions.length}
                      rowHeight={32}
                      rowRenderer={rowRenderer}
                        className="bg-grey-1000 focus:outline-none focus:border-blue-500"
                      overscanRowCount={100}
                    />
                  )}
                </AutoSizer>
              </div>
            </div>
            </div>
          </Fade>
        )}
      </div>
    </div>
  );
}
