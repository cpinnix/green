import React, { useEffect, useState } from "react";
import Head from "next/head";
import Fade from "react-reveal/Fade";
import useInteractors from "hooks/useInteractors";
import createInteractors from "apps/transactions";
import createLogger from "utils/createLogger";
import getYear from "date-fns/getYear";
import getMonth from "date-fns/getMonth";
import uniq from "lodash/uniq";
import sumBy from "lodash/sumBy";
import { MONTH_OPTIONS } from "apps/transactions/constants";
import Navigation from "components/Navigation";
import accounting from "utils/accounting";
import createSpan from "utils/createSpan";
import { format } from "date-fns";
import classes from "./index.module.css";

const log = createLogger("#82B1FF", "[TRENDS]");

function present(interactors) {
  const endSpan = createSpan("[TRENDS] present");

  log("interactors", interactors);

  const transactions = interactors.transactions.selectors.filteredTransactions(
    interactors.transactions.state
  );

  const years = uniq(
    transactions.map((transaction) => getYear(transaction.date))
  );

  const months = uniq(
    transactions.map((transaction) => getMonth(transaction.date))
  );

  const tags = uniq(transactions.map((transaction) => transaction.tag));

  const presentation = {
    state: {
      loading: !interactors.transactions.state.initialized,
      years,
      months,
      tags,
    },
    selectors: {
      net(year, month, tag) {
        let filteredTransactions = transactions;

        if (year !== null && year !== undefined) {
          filteredTransactions = filteredTransactions.filter(
            (transaction) => getYear(transaction.date) === year
          );
        }

        if (month !== null && month !== undefined) {
          filteredTransactions = filteredTransactions.filter(
            (transaction) => getMonth(transaction.date) === month
          );
        }

        if (tag !== null && tag !== undefined) {
          filteredTransactions = filteredTransactions.filter(
            (transaction) => transaction.tag === tag
          );
        }

        return sumBy(filteredTransactions, (transaction) => transaction.amount);
      },
      transactions(year, month, tag) {
        let filteredTransactions = transactions;

        if (year !== null && year !== undefined) {
          filteredTransactions = filteredTransactions.filter(
            (transaction) => getYear(transaction.date) === year
          );
        }

        if (month !== null && month !== undefined) {
          filteredTransactions = filteredTransactions.filter(
            (transaction) => getMonth(transaction.date) === month
          );
        }

        if (tag !== null && tag !== undefined) {
          filteredTransactions = filteredTransactions.filter(
            (transaction) => transaction.tag === tag
          );
        }

        return filteredTransactions;
      },
    },
  };

  log("presentation", presentation);

  endSpan();

  return presentation;
}

function formatCurrency(amount) {
  return accounting.formatColumn([amount, 1000000.0], {
    format: {
      pos: "%s %v", // for positive values, eg. "$ 1.00" (required)
      neg: "%s -%v", // for negative values, eg. "$ (1.00)" [optional]
      zero: "%s  -- ", // for zero values, eg. "$  --" [optional]
    },
  })[0];
}

export default function Page() {
  const interactors = useInteractors(() => createInteractors());

  useEffect(() => {
    interactors.transactions.actions.initiate();
  }, []);

  const [open, setOpen] = useState(null);

  const {
    state: { loading, years, months, tags },
    selectors: { net, transactions },
  } = present(interactors);

  return (
    <div>
      <Head>
        <title>Green - Trends</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Navigation />
      {loading ? null : (
        <div className="p-8">
          {years.map((year) => {
            const netYear = net(year);

            return (
              <div key={year}>
                <Fade>
                  <div className="text-white font-mono text-xs mb-4">
                    {year}
                  </div>
                  <div className="mb-8 border rounded border-white">
                    {tags.map((tag) => {
                      const netTag = net(year, null, tag);
                      return (
                        <div key={tag}>
                          <div
                            className={`${classes.row} cursor-pointer`}
                            onClick={() =>
                              open && open[0] === year && open[2] === tag
                                ? setOpen(null)
                                : setOpen([year, null, tag])
                            }
                          >
                            <div
                              className={`font-mono text-xs whitespace-pre ${
                                netTag < 0 ? "text-red-500" : "text-green-500"
                              }`}
                            >
                              {formatCurrency(netTag)}
                            </div>
                            <div className="font-mono text-xs text-white">
                              {tag}
                            </div>
                          </div>
                          {open && open[0] === year && open[2] === tag && (
                            <div className="border-t border-b border-white my-2 py-2">
                              {transactions(year, null, tag).map(
                                (transaction, index) => (
                                  <div
                                    key={transaction.hash}
                                    className={classes.transaction}
                                  >
                                    <div className="font-mono text-xs text-white">
                                      {index}
                                    </div>
                                    <div className="font-mono text-xs text-white">
                                      {transaction.hash}
                                    </div>
                                    <div className="font-mono text-xs text-white">
                                      {format(
                                        new Date(transaction.date),
                                        "MMM dd yyyy"
                                      )}
                                    </div>
                                    <div
                                      className={`font-mono text-xs text-white ${
                                        transaction.amount < 0
                                          ? "text-red-500"
                                          : "text-green-500"
                                      }`}
                                    >
                                      {new Intl.NumberFormat("EN-US", {
                                        style: "currency",
                                        currency: "USD",
                                      }).format(transaction.amount)}
                                    </div>
                                    <div className="font-mono text-xs text-white">
                                      {transaction.tag}
                                    </div>
                                    <div className="font-mono text-xs text-white">
                                      {transaction.description}
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                    <div className={classes.row}>
                      <div
                        className={`font-mono text-xs whitespace-pre ${
                          netYear < 0 ? "text-red-500" : "text-green-500"
                        }`}
                      >
                        {formatCurrency(netYear)}
                      </div>
                      <div className="font-mono text-xs text-white">net</div>
                    </div>
                  </div>
                </Fade>
                {months.map((month) => {
                  const netMonth = net(year, month);

                  return (
                    <div key={month}>
                      <Fade>
                        <div className="text-white font-mono text-xs mb-4">
                          {MONTH_OPTIONS[month + 1]} {year}
                        </div>
                        <div className="mb-8 border rounded border-white">
                          {tags.map((tag) => {
                            const netTag = net(year, month, tag);
                            const rows = transactions(year, month, tag);

                            return (
                              <div key={tag}>
                                <div
                                  className={`${classes.row} ${
                                    rows.length > 0
                                      ? "cursor-pointer hover:bg-gray-900"
                                      : ""
                                  }`}
                                  onClick={() =>
                                    open &&
                                    open[0] === year &&
                                    open[1] === month &&
                                    open[2] === tag
                                      ? setOpen(null)
                                      : setOpen([year, month, tag])
                                  }
                                >
                                  <div
                                    className={`font-mono text-xs whitespace-pre ${
                                      netTag < 0
                                        ? "text-red-500"
                                        : "text-green-500"
                                    }`}
                                  >
                                    {formatCurrency(netTag)}
                                  </div>{" "}
                                  <div className="font-mono text-xs text-white">
                                    {tag}
                                  </div>
                                </div>
                                {open &&
                                  open[0] === year &&
                                  open[1] === month &&
                                  open[2] === tag &&
                                  rows.length > 0 && (
                                    <div className="border-t border-b border-white my-2 py-2">
                                      {rows.map((transaction, index) => (
                                        <div
                                          key={transaction.hash}
                                          className={classes.transaction}
                                        >
                                          <div className="font-mono text-xs text-white">
                                            {index}
                                          </div>
                                          <div className="font-mono text-xs text-white">
                                            {transaction.hash}
                                          </div>
                                          <div className="font-mono text-xs text-white">
                                            {format(
                                              new Date(transaction.date),
                                              "MMM dd yyyy"
                                            )}
                                          </div>
                                          <div
                                            className={`font-mono text-xs text-white ${
                                              transaction.amount < 0
                                                ? "text-red-500"
                                                : "text-green-500"
                                            }`}
                                          >
                                            {new Intl.NumberFormat("EN-US", {
                                              style: "currency",
                                              currency: "USD",
                                            }).format(transaction.amount)}
                                          </div>
                                          <div className="font-mono text-xs text-white">
                                            {transaction.tag}
                                          </div>
                                          <div className="font-mono text-xs text-white">
                                            {transaction.description}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                              </div>
                            );
                          })}
                          <div className={classes.row}>
                            <div
                              className={`font-mono text-xs whitespace-pre ${
                                netMonth < 0 ? "text-red-500" : "text-green-500"
                              }`}
                            >
                              {formatCurrency(netMonth)}
                            </div>
                            <div className="font-mono text-xs text-white">
                              net
                            </div>
                          </div>
                        </div>
                      </Fade>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
