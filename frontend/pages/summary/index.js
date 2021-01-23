import React, { useEffect, useState, Profiler } from "react";
import Head from "next/head";
import Fade from "react-reveal/Fade";
import useInteractors from "hooks/useInteractors";
import createInteractors from "apps/transactions";
import { MONTH_OPTIONS } from "apps/transactions/constants";
import Navigation from "components/Navigation";
import createLogger from "utils/createLogger";
import createTracer from "utils/createTracer";
import formatCurrency from "utils/formatCurrency";
import classes from "./index.module.css";
import TransactionRow from "components/TransactionRow";

const log = createLogger("#82B1FF", "[SUMMARY]");
const { createSpan } = createTracer(log);

function present(interactors) {
  const endSpan = createSpan("present");

  log("interactors", interactors);

  const presentation = {
    state: {
      loading: !interactors.transactions.state.initialized,
      years: interactors.transactions.selectors.years(
        interactors.transactions.state
      ),
      months: interactors.transactions.selectors.months(
        interactors.transactions.state
      ),
      tags: interactors.transactions.selectors.tags(
        interactors.transactions.state
      ),
      budget: interactors.transactions.selectors.budget(
        interactors.transactions.state
      ),
    },
    selectors: {
      net(year, month, tag) {
        return interactors.transactions.selectors.net(
          interactors.transactions.state,
          { year, month, tag }
        );
      },
      transactions(year, month, tag) {
        return interactors.transactions.selectors.transactionsFiltered(
          interactors.transactions.state,
          { year, month, tag }
        );
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

export default function SummaryPage() {
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
          <title>Summary</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <Navigation />
        {loading ? null : (
          <div className="px-8">
            {years.map((year) => {
              const netYear = net(year);
              return (
                <div key={year}>
                  <Fade>
                    <div className="bg-grey-1000 py-8 mb-8">
                      <div className="text-white font-mono text-xs mb-4 px-8">
                        {year}
                      </div>
                      <div className={classes.row}>
                        <div className="font-mono text-xs text-white">tag</div>
                        <div className={`font-mono text-xs text-white`}>
                          amount
                        </div>
                        <div className={`font-mono text-xs text-white`}>
                          budget
                        </div>
                        <div className={`font-mono text-xs text-white`}>
                          diff
                        </div>
                        <div className="font-mono text-xs text-white">
                          transactions
                        </div>
                      </div>
                      <div className="bg-grey-1000">
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
                                  ${rows.length > 0 ? "cursor-pointer" : ""}
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
                                      {formatCurrency(
                                        netTag - budget[tag] * 12
                                      )}
                                    </div>
                                    <div className="font-mono text-xs text-gray-500">
                                      {rows.length}
                                    </div>
                                  </div>
                                }
                              >
                                <div className="bg-grey-900 max-h-96 overflow-scroll">
                                  {rows.map((transaction) => (
                                    <TransactionRow
                                      key={transaction.hash}
                                      {...transaction}
                                    />
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
                    </div>
                  </Fade>
                  {months.map((month) => {
                    const netMonth = net(year, month);

                    return (
                      <div key={month}>
                        <Fade>
                          <div className="bg-grey-1000 py-8 mb-8">
                            <div className="text-white font-mono text-xs mb-4 px-8">
                              {MONTH_OPTIONS[month]} {year}
                            </div>
                            <div className={classes.row}>
                              <div className="font-mono text-xs text-white">
                                tag
                              </div>
                              <div className={`font-mono text-xs text-white`}>
                                amount
                              </div>
                              <div className={`font-mono text-xs text-white`}>
                                budget
                              </div>
                              <div className={`font-mono text-xs text-white`}>
                                diff
                              </div>
                              <div className="font-mono text-xs text-white">
                                transactions
                              </div>
                            </div>
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
                                            ? "cursor-pointer"
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
                                    <div className="bg-grey-900 max-h-96 overflow-scroll">
                                      {rows.map((transaction) => (
                                        <TransactionRow
                                          key={transaction.hash}
                                          {...transaction}
                                        />
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
