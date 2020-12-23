import React, { useEffect } from "react";
import Head from "next/head";
import useInteractors from "hooks/useInteractors";
import createInteractors from "apps/transactions";
import createLogger from "utils/createLogger";
import set from "date-fns/set";
import getYear from "date-fns/getYear";
import getMonth from "date-fns/getMonth";
import toPairs from "lodash/toPairs";
import { MONTH_OPTIONS } from "apps/transactions/constants";
import Navigation from "components/Navigation";
import classes from "./index.module.css";

const log = createLogger("#82B1FF", "[TRENDS]");

function monthlySummaries({ state, selectors }) {
  if (state.transactions.length === 0) return [];

  const startStamp = performance.now();

  const transactions = selectors.filteredTransactions(state);

  const startTimes = [
    ...Array.apply(null, new Array(12)).map((_, index) =>
      set(new Date(), {
        year: 2020,
        month: index,
        date: 1,
        hour: 0,
        minutes: 0,
        seconds: 0,
      })
    ),
    set(new Date(), {
      year: 2021,
      month: 0,
      date: 1,
      hour: 0,
      minutes: 0,
      seconds: 0,
    }),
  ];

  let trends = transactions
    .reduce((acc, transaction) => {
      const index = startTimes.findIndex((start) => {
        const date = transaction.date;
        return (
          getYear(date) === getYear(start) && getMonth(date) === getMonth(start)
        );
      });

      if (!acc[index]) {
        acc[index] = { transactions: [], tags: {} };
      }

      acc[index].transactions.push(transaction);

      if (!acc[index].tags[transaction.tag]) {
        acc[index].tags[transaction.tag] = 0;
      }

      acc[index].tags[transaction.tag] =
        acc[index].tags[transaction.tag] + transaction.amount;

      if (!acc[index].net) {
        acc[index].net = 0;
      }

      acc[index].net = acc[index].net + transaction.amount;

      return acc;
    }, [])
    .map((trend) => ({
      ...trend,
      tags: toPairs(trend.tags).sort((a, b) => b[1] - a[1]),
    }));

  const endStamp = performance.now();
  log("performance - monthlySummaries", endStamp - startStamp);

  return trends;
}

function present(interactors) {
  log("interactors", interactors);

  const { state, selectors } = interactors.transactions;

  const presentation = {
    state: {
      trends: monthlySummaries(interactors.transactions),
    },
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
    state: { trends },
  } = present(interactors);

  return (
    <div>
      <Head>
        <title>Green - Trends</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Navigation />
      <div className="p-8">
        {trends &&
          trends.map((trend, index) => (
            <div key={index}>
              <div className="font-mono text-xs text-white mb-4">
                {MONTH_OPTIONS[index + 1]} 2020
              </div>
              <div className="mb-8 border rounded border-white">
                {trend.tags.map((tag) => (
                  <div className={classes.row} key={tag[0]}>
                    <div className="font-mono text-xs text-white">{tag[0]}</div>
                    <div
                      className={`font-mono text-xs ${
                        tag[1] < 0 ? "text-red-500" : "text-green-500"
                      }`}
                    >
                      {new Intl.NumberFormat("EN-US", {
                        style: "currency",
                        currency: "USD",
                      }).format(tag[1])}
                    </div>
                  </div>
                ))}
                <div className={classes.row}>
                  <div className="font-mono text-xs text-white">net</div>
                  <div
                    className={`font-mono text-xs ${
                      trend.net < 0 ? "text-red-500" : "text-green-500"
                    }`}
                  >
                    {new Intl.NumberFormat("EN-US", {
                      style: "currency",
                      currency: "USD",
                    }).format(trend.net)}
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
