import React, { useEffect, useState, Profiler } from "react";
import Head from "next/head";
import Fade from "react-reveal/Fade";
import useInteractors from "hooks/useInteractors";
import createInteractors from "apps/transactions";
import getYear from "date-fns/getYear";
import getMonth from "date-fns/getMonth";
import uniq from "lodash/uniq";
import sumBy from "lodash/sumBy";
import { MONTH_OPTIONS } from "apps/transactions/constants";
import Navigation from "components/Navigation";
import {
  Sparklines,
  SparklinesBars,
  SparklinesCurve,
  SparklinesLine,
  SparklinesReferenceLine,
} from "react-sparklines";
import createLogger from "utils/createLogger";
import createTracer from "utils/createTracer";
import formatCurrency from "utils/formatCurrency";
import { format } from "date-fns";
import classes from "./index.module.css";

const log = createLogger("#82B1FF", "[SUMMARY]");
const { createSpan } = createTracer(log);

function present(interactors) {
  const endSpan = createSpan("present");

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
      budget: interactors.transactions.selectors.budget(
        interactors.transactions.state
      ),
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

function Accordion({ header, children, enabled }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <div onClick={() => enabled && setOpen(!open)}>{header}</div>
      {open && children}
    </div>
  );
}

export default function Page() {
  const interactors = useInteractors(() => createInteractors());

  useEffect(() => {
    interactors.transactions.actions.initiate();
  }, []);

  const {
    state: { loading, years, months, tags, budget },
    selectors: { net, transactions },
  } = present(interactors);

  return (
    <Profiler
      id="summary"
      onRender={(id, phase, actualDuration) =>
        log("[PERFORMANCE] actual", phase, "duration", actualDuration)
      }
    >
      <div>
        <Head>
          <title>Green - Trends</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <Navigation />
        {loading ? null : (
          <div className="px-8 mt-8">
            {years.map((year) => {
              const netYear = net(year);
              return (
                <div key={year}>
                  <Fade>
                    <div className="text-white font-mono text-xs mb-4">
                      {year}
                    </div>
                    <div className={classes.row}>
                      <div className="font-mono text-xs text-gray-500">tag</div>
                      <div className={`font-mono text-xs text-gray-500`}>
                        amount
                      </div>
                      <div className={`font-mono text-xs text-gray-500`}>
                        budget
                      </div>
                      <div className={`font-mono text-xs text-gray-500`}>
                        diff
                      </div>

                      <div className="font-mono text-xs text-gray-500">
                        transactions
                      </div>
                    </div>
                    <div className="mb-8 border-t border-b border-gray-600">
                      {tags.map((tag) => {
                        const netTag = net(year, null, tag);
                        const rows = transactions(year, null, tag);
                        return (
                          <div key={tag}>
                            <Accordion
                              enabled={rows.length > 0}
                              header={
                                <div
                                  className={`
                                  ${classes.row}
                                  ${
                                    rows.length > 0
                                      ? "cursor-pointer hover:bg-gray-900"
                                      : ""
                                  }
                                `}
                                >
                                  <div className="font-mono text-xs text-white">
                                    {tag}
                                  </div>
                                  <div
                                    className={`font-mono text-xs whitespace-pre ${
                                      netTag < 0
                                        ? "text-red-500"
                                        : "text-green-500"
                                    }`}
                                  >
                                    {formatCurrency(netTag)}
                                  </div>
                                  <div
                                    className={`font-mono text-xs whitespace-pre text-gray-500`}
                                  >
                                    {formatCurrency(budget[tag] * 12)}
                                  </div>
                                  <div
                                    className={`font-mono text-xs whitespace-pre ${
                                      netTag - budget[tag] * 12 < 0
                                        ? "text-red-500"
                                        : "text-green-500"
                                    }`}
                                  >
                                    {formatCurrency(netTag - budget[tag] * 12)}
                                  </div>
                                  <div className="font-mono text-xs text-gray-500">
                                    {rows.length}
                                  </div>
                                </div>
                              }
                            >
                              <div className="border-t border-b border-white max-h-64 overflow-scroll">
                                {rows.map((transaction) => (
                                  <div
                                    key={transaction.hash}
                                    className={classes.transaction}
                                  >
                                    <div
                                      className={`font-mono text-xs text-white whitespace-pre ${
                                        transaction.amount < 0
                                          ? "text-red-500"
                                          : "text-green-500"
                                      }`}
                                    >
                                      {formatCurrency(transaction.amount)}
                                    </div>
                                    <div className="font-mono text-xs text-white">
                                      {transaction.tag}
                                    </div>
                                    <div className="font-mono text-xs text-white overflow-x-hidden whitespace-nowrap">
                                      {transaction.description}
                                    </div>
                                    <div className="font-mono text-xs text-white">
                                      {format(
                                        new Date(transaction.date),
                                        "MMM dd yyyy"
                                      )}
                                    </div>
                                    <div className="font-mono text-xs text-white">
                                      {transaction.hash}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </Accordion>
                          </div>
                        );
                      })}
                      <div className={classes.row}>
                        <div className="font-mono text-xs text-white">net</div>
                        <div
                          className={`font-mono text-xs whitespace-pre ${
                            netYear < 0 ? "text-red-500" : "text-green-500"
                          }`}
                        >
                          {formatCurrency(netYear)}
                        </div>
                        <div
                          className={`font-mono text-xs whitespace-pre text-gray-500`}
                        >
                          {formatCurrency(budget.net * 12)}
                        </div>
                        <div
                          className={`font-mono text-xs whitespace-pre ${
                            netYear - budget.net * 12 < 0
                              ? "text-red-500"
                              : "text-green-500"
                          }`}
                        >
                          {formatCurrency(netYear - budget.net * 12)}
                        </div>
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
                          <div className={classes.row}>
                            <div className="font-mono text-xs text-gray-500">
                              tag
                            </div>
                            <div className={`font-mono text-xs text-gray-500`}>
                              amount
                            </div>
                            <div className={`font-mono text-xs text-gray-500`}>
                              budget
                            </div>
                            <div className={`font-mono text-xs text-gray-500`}>
                              diff
                            </div>
                            <div className="font-mono text-xs text-gray-500">
                              transactions
                            </div>
                          </div>
                          <div className="mb-8 border-t border-b border-gray-600">
                            {tags.map((tag) => {
                              const netTag = net(year, month, tag);
                              const rows = transactions(year, month, tag);

                              return (
                                <div key={tag}>
                                  <Accordion
                                    enabled={rows.length > 0}
                                    header={
                                      <div
                                        className={`
                                        ${classes.row}
                                        ${
                                          rows.length > 0
                                            ? "cursor-pointer hover:bg-gray-900"
                                            : ""
                                        }
                                      `}
                                      >
                                        <div className="font-mono text-xs text-white">
                                          {tag}
                                        </div>
                                        <div
                                          className={`font-mono text-xs whitespace-pre ${
                                            netTag < 0
                                              ? "text-red-500"
                                              : "text-green-500"
                                          }`}
                                        >
                                          {formatCurrency(netTag)}
                                        </div>
                                        <div
                                          className={`font-mono text-xs whitespace-pre text-gray-500`}
                                        >
                                          {formatCurrency(budget[tag])}
                                        </div>
                                        <div
                                          className={`font-mono text-xs whitespace-pre ${
                                            netTag - budget[tag] < 0
                                              ? "text-red-500"
                                              : "text-green-500"
                                          }`}
                                        >
                                          {formatCurrency(netTag - budget[tag])}
                                        </div>
                                        <div className="font-mono text-xs text-gray-500">
                                          {rows.length}
                                        </div>
                                      </div>
                                    }
                                  >
                                    <div className="border-t border-b border-white max-h-64 overflow-scroll">
                                      {rows.map((transaction) => (
                                        <div
                                          key={transaction.hash}
                                          className={classes.transaction}
                                        >
                                          <div
                                            className={`font-mono text-xs text-white whitespace-pre ${
                                              transaction.amount < 0
                                                ? "text-red-500"
                                                : "text-green-500"
                                            }`}
                                          >
                                            {formatCurrency(transaction.amount)}
                                          </div>
                                          <div className="font-mono text-xs text-white">
                                            {transaction.tag}
                                          </div>
                                          <div className="font-mono text-xs text-white overflow-x-hidden whitespace-nowrap">
                                            {transaction.description}
                                          </div>
                                          <div className="font-mono text-xs text-white">
                                            {format(
                                              new Date(transaction.date),
                                              "MMM dd yyyy"
                                            )}
                                          </div>
                                          <div className="font-mono text-xs text-white">
                                            {transaction.hash}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </Accordion>
                                </div>
                              );
                            })}
                            <div className={classes.row}>
                              <div className="font-mono text-xs text-white">
                                net
                              </div>
                              <div
                                className={`font-mono text-xs whitespace-pre ${
                                  netMonth < 0
                                    ? "text-red-500"
                                    : "text-green-500"
                                }`}
                              >
                                {formatCurrency(netMonth)}
                              </div>
                              <div
                                className={`font-mono text-xs whitespace-pre text-gray-500`}
                              >
                                {formatCurrency(budget.net)}
                              </div>
                              <div
                                className={`font-mono text-xs whitespace-pre ${
                                  netMonth - budget.net < 0
                                    ? "text-red-500"
                                    : "text-green-500"
                                }`}
                              >
                                {formatCurrency(netMonth - budget.net)}
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
    </Profiler>
  );
}
