import React, { useEffect, useState } from "react";
import Head from "next/head";
import getYear from "date-fns/getYear";
import getMonth from "date-fns/getMonth";
import toDate from "date-fns/toDate";
import uniq from "lodash/uniq";
import useInteractors from "hooks/useInteractors";
import createInteractors from "apps/transactions";
import createLogger from "utils/createLogger";
import { SizeMe as Size } from "react-sizeme";
import { scaleTime, scaleLinear } from "d3-scale";
import { interpolateSinebow } from "d3-scale-chromatic";
import formatCurrency from "utils/formatCurrency";
import { format } from "date-fns";
import Navigation from "components/Navigation";
import classes from "./index.module.css";
import Fade from "react-reveal/Fade";

function Row({ amount, tag, date, hash, description }) {
  return (
    <div className={classes.transaction}>
      <div
        className={`font-mono text-xs text-white whitespace-pre ${
          amount < 0 ? "text-red-500" : "text-green-500"
        }`}
      >
        {formatCurrency(amount)}
      </div>
      <div className="font-mono text-xs text-white">{tag}</div>
      <div className="font-mono text-xs text-white overflow-x-hidden whitespace-nowrap">
        {description}
      </div>
      <div className="font-mono text-xs text-white">
        {format(new Date(date), "MMM dd yyyy")}
      </div>
      <div className="font-mono text-xs text-white">{hash}</div>
    </div>
  );
}

const log = createLogger("#82B1FF", "[SUMMARY]");

function present(interactors) {
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
      ...interactors.transactions.state,
      years,
      months,
      tags,
    },
    selectors: {
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
    actions: interactors.transactions.actions,
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
    state: { tags },
    selectors: { transactions },
  } = present(interactors);

  const [hoveredRow, updateHoveredRow] = useState(null);

  const table = transactions();

  const tableSortedByAmount = table.sort((a, b) => a.amount - b.amount);

  return (
    <div>
      <Head>
        <title>Green - Trends</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Navigation />
      <div className="h-8" />
      {table.length > 0 && (
        <Fade>
          <div className="font-mono text-xs text-white px-8 mb-4">2020</div>
          <div className="px-8">
            <div className="h-px bg-gray-500"></div>
          </div>
          <Size monitorHeight>
            {({ size }) => {
              var PADDING = 32;
              const RADIUS = 4;
              const xRange = [0, size.width - PADDING * 2 - RADIUS * 2];
              const xDomain = [
                new Date("2020", "0", "1"),
                new Date("2020", "11", "31"),
              ];
              const yRange = [0, size.height - PADDING * 2 - RADIUS * 2];
              const yDomain = [
                tableSortedByAmount[tableSortedByAmount.length - 1].amount,
                tableSortedByAmount[0].amount,
              ];

              var x = scaleTime().domain(xDomain).range(xRange);
              var y = scaleLinear().domain(yDomain).range(yRange);

              return (
                <div style={{ height: "40rem" }}>
                  <div className="font-mono text-xs text-white">
                    <svg viewBox={`0 0 ${size.width} ${size.height}`}>
                      {table.map((row, index) => (
                        <circle
                          key={index}
                          cx={x(toDate(row.date)) + PADDING + RADIUS}
                          cy={y(row.amount) + PADDING + RADIUS}
                          r={RADIUS}
                          strokeWidth={2}
                          stroke={
                            hoveredRow && row.tag === hoveredRow.tag
                              ? interpolateSinebow(
                                  tags.findIndex((tag) => tag === row.tag) /
                                    tags.length
                                )
                              : interpolateSinebow(
                                  tags.findIndex((tag) => tag === row.tag) /
                                    tags.length
                                )
                          }
                          style={{
                            opacity:
                              hoveredRow && row.tag !== hoveredRow.tag ? 0 : 1,
                          }}
                          onMouseEnter={() => updateHoveredRow(row)}
                          onMouseLeave={() => updateHoveredRow(null)}
                        />
                      ))}
                    </svg>
                  </div>
                </div>
              );
            }}
          </Size>
        </Fade>
      )}
      <div className="px-8">
        <div className="h-px bg-gray-500" />
      </div>
      <div className="px-8">{hoveredRow && <Row {...hoveredRow} />}</div>
    </div>
  );
}
